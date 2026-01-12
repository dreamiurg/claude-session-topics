#!/usr/bin/env node
import { releaseLock } from './lock.js';
import { readState, writeState } from './state.js';
import { generateTopic } from './topic-generator.js';
import type { SessionState } from './types.js';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    process.exit(1);
  }

  const [sessionId, context, source, tempDir] = args;

  try {
    const topic = await generateTopic(context, source as 'claude-mem' | 'transcript');

    if (topic) {
      // Read current state to preserve count
      const currentState = readState(sessionId, tempDir);
      const newState: SessionState = {
        count: currentState?.count || 0,
        topic,
        error: '',
        generated_at: Date.now()
      };
      writeState(sessionId, newState, tempDir);
    }
  } catch (error) {
    if (process.env.CLAUDE_TOPIC_DEBUG) {
      console.error('[BACKGROUND ERROR]', error);
    }
  } finally {
    releaseLock(sessionId, tempDir);
  }
}

main();
