#!/usr/bin/env node
import { appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { forceReleaseLock } from './lock.js';
import { readState, writeState } from './state.js';
import { generateTopic } from './topic-generator.js';
import type { SessionState } from './types.js';

function log(sessionId: string, message: string, data?: unknown) {
  try {
    const logPath = join(tmpdir(), 'claude-topic-background.log');
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    appendFileSync(logPath, `[${timestamp}] [${sessionId}] ${message}${dataStr}\n`);
  } catch {
    // Ignore logging errors
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    log('UNKNOWN', 'Insufficient arguments', { argsLength: args.length });
    process.exit(1);
  }

  const [sessionId, context, source, tempDir] = args;

  log(sessionId, 'Background generator started', {
    source,
    contextLength: context.length,
    tempDir: tempDir || 'default'
  });

  try {
    // Read current state first to get previous topic and preserve count
    log(sessionId, 'Reading current state');
    const currentState = readState(sessionId, tempDir);
    log(sessionId, 'Current state read', {
      count: currentState?.count,
      previousTopic: currentState?.topic
    });

    log(sessionId, 'Calling generateTopic');
    const topic = await generateTopic(
      context,
      source as 'claude-mem' | 'transcript',
      currentState?.topic
    );

    log(sessionId, 'generateTopic returned', { topic, topicLength: topic?.length });

    if (topic) {
      const newState: SessionState = {
        count: currentState?.count || 0,
        topic,
        error: '',
        generated_at: Date.now()
      };

      log(sessionId, 'Writing new state', { count: newState.count, topicLength: topic.length });
      writeState(sessionId, newState, tempDir);
      log(sessionId, 'State written successfully');
    } else {
      log(sessionId, 'No topic generated');
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    log(sessionId, 'ERROR in background generator', { error: errorMsg, stack: errorStack });

    if (process.env.CLAUDE_TOPIC_DEBUG) {
      console.error('[BACKGROUND ERROR]', error);
    }
  } finally {
    log(sessionId, 'Releasing lock');
    await forceReleaseLock(sessionId, tempDir);
    log(sessionId, 'Background generator exiting');
  }
}

// Execute main function
main().catch((err) => {
  console.error('Fatal error in background generator:', err);
  process.exit(1);
});
