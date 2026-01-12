import { spawn } from 'node:child_process';
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

export async function handleStopHook(input: HookInput, tempDir?: string): Promise<void> {
  const { session_id, cwd, transcript_path, stop_hook_active } = input;

  // Skip if already in stop hook (prevent infinite loops)
  if (stop_hook_active) {
    return;
  }

  // Validate session ID
  if (!validateSessionId(session_id)) {
    return;
  }

  // Read or initialize state
  let state = readState(session_id, tempDir);
  if (!state) {
    state = {
      count: 0,
      topic: '',
      error: '',
      generated_at: Date.now()
    };
  }

  // Increment count
  state.count++;

  // Check if we should generate
  if (!shouldGenerate(state.count, state.topic)) {
    // Just update count
    state.generated_at = Date.now();
    writeState(session_id, state, tempDir);
    return;
  }

  // Try to acquire lock
  if (!acquireLock(session_id, tempDir)) {
    // Another process is generating, just update count
    state.generated_at = Date.now();
    writeState(session_id, state, tempDir);
    return;
  }

  try {
    // Try claude-mem first
    let context = await getClaudeMemContext(session_id);
    let source: 'claude-mem' | 'transcript' = 'claude-mem';

    // Fallback to transcript
    if (!context) {
      const transcriptFilePath = transcript_path || findTranscriptPath(session_id, cwd);
      if (transcriptFilePath) {
        context = await parseTranscript(transcriptFilePath);
        source = 'transcript';
      }
    }

    if (!context) {
      state.error = 'waiting for conversation';
      state.generated_at = Date.now();
      writeState(session_id, state, tempDir);
      releaseLock(session_id, tempDir);
      return;
    }

    // Spawn detached background process to generate topic
    const scriptPath = join(__dirname, 'background-generator.js');
    const args = [session_id, context, source, tempDir || ''];

    const child = spawn('node', [scriptPath, ...args], {
      detached: true,
      stdio: 'ignore',
      env: process.env
    });

    child.unref(); // Allow parent to exit independently

    // Write current state (background will update when done)
    state.error = '';
    state.generated_at = Date.now();
    writeState(session_id, state, tempDir);
  } catch (error) {
    releaseLock(session_id, tempDir);
    state.error = error instanceof Error ? error.message : 'unknown error';
    state.generated_at = Date.now();
    writeState(session_id, state, tempDir);
  }
}
