#!/usr/bin/env node
// src/cli-force-topic.ts
import { readFileSync } from 'node:fs';
import { getClaudeMemContext } from './claude-mem.js';
import { writeState } from './state.js';
import { generateTopic } from './topic-generator.js';
import { findTranscriptPath, parseTranscript } from './transcript.js';
import { validateSessionId } from './validation.js';
async function main() {
    try {
        let session_id;
        let cwd;
        // Check if we have command-line arguments
        if (process.argv.length > 2) {
            // Called with arguments: node cli-force-topic.js <session-id> [cwd]
            session_id = process.argv[2];
            cwd = process.argv[3] || process.cwd();
        }
        else {
            // Read from stdin (skill format)
            const input = readFileSync(0, 'utf-8');
            const parsed = JSON.parse(input);
            session_id = parsed.session_id;
            cwd = parsed.cwd;
        }
        if (!validateSessionId(session_id)) {
            console.error('Invalid session ID format');
            process.exit(1);
        }
        // Get context
        let context = await getClaudeMemContext(session_id);
        let source = 'claude-mem';
        if (!context) {
            const transcriptPath = findTranscriptPath(session_id, cwd);
            if (transcriptPath) {
                context = await parseTranscript(transcriptPath);
                source = 'transcript';
            }
        }
        if (!context) {
            console.error('No context available - session too new or no conversation yet');
            process.exit(1);
        }
        // Read current state to get previous topic for continuity
        const { readState } = await import('./state.js');
        const currentState = readState(session_id, cwd);
        const previousTopic = currentState?.topic;
        console.log('Generating topic...');
        const topic = await generateTopic(context, source, previousTopic);
        if (!topic) {
            console.error('Failed to generate topic');
            process.exit(1);
        }
        // Update state (preserve count if it exists)
        const state = {
            count: currentState?.count || 0,
            topic,
            error: '',
            generated_at: Date.now()
        };
        writeState(session_id, state);
        console.log(`Topic: ${topic}`);
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'unknown');
        process.exit(1);
    }
}
main();
//# sourceMappingURL=cli-force-topic.js.map
