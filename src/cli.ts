#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { handleStopHook } from './hook-handler.js';
import type { HookInput } from './types.js';

async function main() {
  if (process.env.CLAUDE_TOPIC_DEBUG) {
    console.error('[DEBUG] CLI starting');
  }

  try {
    // Read JSON from stdin
    if (process.env.CLAUDE_TOPIC_DEBUG) {
      console.error('[DEBUG] Reading stdin');
    }
    const input = readFileSync(0, 'utf-8');

    if (process.env.CLAUDE_TOPIC_DEBUG) {
      console.error('[DEBUG] Parsing JSON');
    }
    const hookInput = JSON.parse(input) as HookInput;

    if (process.env.CLAUDE_TOPIC_DEBUG) {
      console.error(`[DEBUG] Hook event: ${hookInput.hook_event_name}`);
    }

    // Handle based on hook type
    if (hookInput.hook_event_name === 'Stop') {
      if (process.env.CLAUDE_TOPIC_DEBUG) {
        console.error('[DEBUG] Calling handleStopHook');
      }
      await handleStopHook(hookInput);
      if (process.env.CLAUDE_TOPIC_DEBUG) {
        console.error('[DEBUG] handleStopHook completed');
      }
    }
    // SessionEnd handled by cleanup script (can add later)

    if (process.env.CLAUDE_TOPIC_DEBUG) {
      console.error('[DEBUG] Main function completing');
    }
  } catch (error) {
    // Silent failure - hooks should not interrupt Claude
    if (process.env.CLAUDE_TOPIC_DEBUG) {
      console.error('[ERROR]', error);
    }
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  if (process.env.CLAUDE_TOPIC_DEBUG) {
    console.error('[UNHANDLED REJECTION]', error);
  }
  process.exit(1);
});

main()
  .then(() => {
    if (process.env.CLAUDE_TOPIC_DEBUG) {
      console.error('[DEBUG] Exiting with code 0');
    }
    process.exit(0);
  })
  .catch((error) => {
    if (process.env.CLAUDE_TOPIC_DEBUG) {
      console.error('[FATAL]', error);
    }
    process.exit(1);
  });
