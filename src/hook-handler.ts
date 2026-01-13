import { spawn } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getClaudeMemContext } from './claude-mem.js';
import { acquireLock, releaseLock } from './lock.js';
import { shouldGenerate } from './schedule.js';
import { readState, writeState } from './state.js';
import { findTranscriptPath, parseTranscript } from './transcript.js';
import type { HookInput } from './types.js';
import { validateSessionId } from './validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function log(sessionId: string, message: string, data?: unknown) {
  try {
    const logPath = join(tmpdir(), 'claude-topic-hook-handler.log');
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    appendFileSync(logPath, `[${timestamp}] [${sessionId}] ${message}${dataStr}\n`);
  } catch {
    // Ignore logging errors
  }
}

export async function handleStopHook(input: HookInput, tempDir?: string): Promise<void> {
  const { session_id, cwd, transcript_path } = input;

  log(session_id, 'handleStopHook called');

  // Validate session ID
  if (!validateSessionId(session_id)) {
    log(session_id, 'Invalid session ID');
    return;
  }

  // Read or initialize state
  let state = readState(session_id, tempDir);
  if (!state) {
    log(session_id, 'Initializing new state');
    state = {
      count: 0,
      topic: '',
      error: '',
      generated_at: Date.now()
    };
  } else {
    log(session_id, 'State loaded', { count: state.count, hasTopic: !!state.topic });
  }

  // Increment count
  state.count++;
  log(session_id, 'Count incremented', { newCount: state.count });

  // Check if we should generate
  if (!shouldGenerate(state.count, state.topic)) {
    log(session_id, 'Should not generate yet', { count: state.count, hasTopic: !!state.topic });
    // Just update count
    state.generated_at = Date.now();
    writeState(session_id, state, tempDir);
    return;
  }

  log(session_id, 'Should generate topic', { count: state.count });

  // Try to acquire lock
  if (!acquireLock(session_id, tempDir)) {
    log(session_id, 'Could not acquire lock - another process generating');
    // Another process is generating, just update count
    state.generated_at = Date.now();
    writeState(session_id, state, tempDir);
    return;
  }

  log(session_id, 'Lock acquired');

  try {
    // Try claude-mem first
    log(session_id, 'Fetching claude-mem context');
    let context = await getClaudeMemContext(session_id);
    let source: 'claude-mem' | 'transcript' = 'claude-mem';

    // Fallback to transcript
    if (!context) {
      log(session_id, 'No claude-mem context, trying transcript');
      const transcriptFilePath = transcript_path || findTranscriptPath(session_id, cwd);
      log(session_id, 'Transcript path', { transcriptFilePath });
      if (transcriptFilePath) {
        context = await parseTranscript(transcriptFilePath);
        source = 'transcript';
        log(session_id, 'Transcript parsed', { contextLength: context?.length });
      }
    } else {
      log(session_id, 'Claude-mem context obtained', { contextLength: context.length });
    }

    if (!context) {
      log(session_id, 'No context available');
      state.error = 'waiting for conversation';
      state.generated_at = Date.now();
      writeState(session_id, state, tempDir);
      releaseLock(session_id, tempDir);
      return;
    }

    // Spawn detached background process to generate topic
    const scriptPath = join(__dirname, 'background-generator.js');
    const args = [session_id, context, source, tempDir || ''];

    log(session_id, 'Spawning background generator', {
      scriptPath,
      argsLength: args.length,
      contextLength: context.length
    });

    const child = spawn('node', [scriptPath, ...args], {
      detached: true,
      stdio: 'ignore',
      env: process.env
    });

    child.unref(); // Allow parent to exit independently

    log(session_id, 'Background generator spawned', { pid: child.pid });

    // Write current state (background will update when done)
    state.error = '';
    state.generated_at = Date.now();
    writeState(session_id, state, tempDir);
    log(session_id, 'State written, waiting for background generator to complete');
  } catch (error) {
    log(session_id, 'ERROR in handleStopHook', {
      error: error instanceof Error ? error.message : String(error)
    });
    releaseLock(session_id, tempDir);
    state.error = error instanceof Error ? error.message : 'unknown error';
    state.generated_at = Date.now();
    writeState(session_id, state, tempDir);
  }
}
