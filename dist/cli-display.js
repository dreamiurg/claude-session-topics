#!/usr/bin/env node
// src/cli-display.ts
import { appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { formatTopicDisplay } from './display.js';
import { readState } from './state.js';
import { validateSessionId } from './validation.js';
function log(message, data) {
    try {
        const logPath = join(tmpdir(), 'claude-topic-display.log');
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` ${JSON.stringify(data)}` : '';
        appendFileSync(logPath, `[${timestamp}] ${message}${dataStr}\n`);
    }
    catch {
        // Ignore logging errors
    }
}
async function readStdin() {
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
    log('Display CLI started', { args: process.argv.slice(2), isTTY: process.stdin.isTTY });
    try {
        // Read from stdin if available (ccstatusline format)
        let sessionId;
        // First check command line argument
        if (process.argv[2]) {
            sessionId = process.argv[2];
            log('Using command line arg', { sessionId });
        }
        // Fall back to stdin if no argument provided
        if (!sessionId && process.stdin.isTTY !== true) {
            log('Reading from stdin');
            const input = await readStdin();
            log('Stdin received', { length: input.length, preview: input.slice(0, 100) });
            if (input.trim()) {
                const parsed = JSON.parse(input);
                sessionId = parsed.session_id;
                log('Parsed session ID from stdin', { sessionId });
            }
        }
        if (!sessionId) {
            log('No session ID - showing default message');
            console.log('New session: gathering context');
            return;
        }
        log('Validating session ID', { sessionId });
        if (!validateSessionId(sessionId)) {
            log('Invalid session ID');
            return;
        }
        log('Reading state', { sessionId });
        const state = readState(sessionId);
        log('State read', { state });
        const display = formatTopicDisplay(state);
        log('Displaying', { display });
        console.log(display);
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.stack : String(error);
        log('ERROR', { error: errorMsg });
        // Silent failure unless debug mode
        if (process.env.CLAUDE_TOPIC_DEBUG) {
            console.error('[ERROR]', error);
        }
        process.exit(1);
    }
}
main()
    .then(() => {
    log('Exiting success');
    process.exit(0);
})
    .catch((error) => {
    log('FATAL ERROR', { error: error instanceof Error ? error.stack : String(error) });
    process.exit(1);
});
//# sourceMappingURL=cli-display.js.map
