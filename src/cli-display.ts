#!/usr/bin/env node
// src/cli-display.ts
import { readFileSync } from 'node:fs';
import { formatTopicDisplay } from './display.js';
import { readState } from './state.js';
import { validateSessionId } from './validation.js';

interface StatusLineInput {
  session_id?: string;
}

function main() {
  try {
    // Read from stdin if available (ccstatusline format)
    let sessionId: string | undefined;

    if (!process.stdin.isTTY) {
      const input = readFileSync(0, 'utf-8');
      if (input.trim()) {
        const parsed = JSON.parse(input) as StatusLineInput;
        sessionId = parsed.session_id;
      }
    }

    // Or from command line argument
    if (!sessionId && process.argv[2]) {
      sessionId = process.argv[2];
    }

    if (!sessionId) {
      console.log('New session: gathering context');
      return;
    }

    if (!validateSessionId(sessionId)) {
      return;
    }

    const state = readState(sessionId);
    const display = formatTopicDisplay(state);
    console.log(display);
  } catch (error) {
    // Silent failure unless debug mode
    if (process.env.CLAUDE_TOPIC_DEBUG) {
      console.error('[ERROR]', error);
    }
  }
}

main();
