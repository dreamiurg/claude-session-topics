#!/usr/bin/env node
import { appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { handleStopHook } from './hook-handler.js';
import type { HookInput } from './types.js';

// Log that we started IMMEDIATELY
try {
  const logPath = join(tmpdir(), 'claude-topic-invocation.log');
  const timestamp = new Date().toISOString();
  appendFileSync(logPath, `[${timestamp}] Hook invoked\n`);
} catch {
  // Ignore
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
  });
}

async function main() {
  if (process.env.CLAUDE_TOPIC_DEBUG) {
    console.error('[DEBUG] CLI starting');
  }

  try {
    // Read JSON from stdin asynchronously
    if (process.env.CLAUDE_TOPIC_DEBUG) {
      console.error('[DEBUG] Reading stdin');
    }
    const input = await readStdin();

    if (process.env.CLAUDE_TOPIC_DEBUG) {
      console.error('[DEBUG] Parsing JSON');
    }

    if (!input || input.trim() === '') {
      if (process.env.CLAUDE_TOPIC_DEBUG) {
        console.error('[DEBUG] Empty input received');
      }
      return;
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
    // Log errors to temp file for debugging
    try {
      const fs = await import('node:fs');
      const os = await import('node:os');
      const path = await import('node:path');
      const logPath = path.join(os.tmpdir(), 'claude-topic-error.log');
      const timestamp = new Date().toISOString();
      const errorMsg = error instanceof Error ? error.stack : String(error);
      fs.appendFileSync(logPath, `[${timestamp}] ${errorMsg}\n\n`);
    } catch {
      // Ignore logging errors
    }

    // Silent failure - hooks should not interrupt Claude
    if (process.env.CLAUDE_TOPIC_DEBUG) {
      console.error('[ERROR]', error);
    }

    // Exit with error code
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  // Log to temp file
  try {
    const fs = require('node:fs');
    const os = require('node:os');
    const path = require('node:path');
    const logPath = path.join(os.tmpdir(), 'claude-topic-error.log');
    const timestamp = new Date().toISOString();
    const errorMsg = error instanceof Error ? error.stack : String(error);
    fs.appendFileSync(logPath, `[${timestamp}] UNHANDLED REJECTION: ${errorMsg}\n\n`);
  } catch {
    // Ignore logging errors
  }

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
    // Log to temp file
    try {
      const fs = require('node:fs');
      const os = require('node:os');
      const path = require('node:path');
      const logPath = path.join(os.tmpdir(), 'claude-topic-error.log');
      const timestamp = new Date().toISOString();
      const errorMsg = error instanceof Error ? error.stack : String(error);
      fs.appendFileSync(logPath, `[${timestamp}] FATAL: ${errorMsg}\n\n`);
    } catch {
      // Ignore logging errors
    }

    if (process.env.CLAUDE_TOPIC_DEBUG) {
      console.error('[FATAL]', error);
    }
    process.exit(1);
  });
