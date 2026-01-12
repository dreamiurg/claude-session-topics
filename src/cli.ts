#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { handleStopHook } from './hook-handler.js';
import type { HookInput } from './types.js';

async function main() {
  try {
    // Read JSON from stdin
    const input = readFileSync(0, 'utf-8');
    const hookInput = JSON.parse(input) as HookInput;

    // Handle based on hook type
    if (hookInput.hook_event_name === 'Stop') {
      await handleStopHook(hookInput);
    }
    // SessionEnd handled by cleanup script (can add later)
  } catch (error) {
    // Silent failure - hooks should not interrupt Claude
    if (process.env.CLAUDE_TOPIC_DEBUG) {
      console.error('[ERROR]', error);
    }
  }
}

main();
