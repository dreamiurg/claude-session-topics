#!/usr/bin/env node
// src/cli-force-topic.ts
import { readFileSync } from 'fs';
import { readState, writeState } from './state.js';
import { validateSessionId } from './validation.js';
import { getClaudeMemContext } from './claude-mem.js';
import { findTranscriptPath, parseTranscript } from './transcript.js';
import { generateTopic } from './topic-generator.js';

async function main() {
  try {
    // Read session ID from stdin (skill format)
    const input = readFileSync(0, 'utf-8');
    const { session_id, cwd } = JSON.parse(input) as { session_id: string; cwd: string };

    if (!validateSessionId(session_id)) {
      console.error('Invalid session ID format');
      process.exit(1);
    }

    // Get context
    let context = await getClaudeMemContext(session_id);
    let source: 'claude-mem' | 'transcript' = 'claude-mem';

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

    console.log('Generating topic...');
    const topic = await generateTopic(context, source);

    if (!topic) {
      console.error('Failed to generate topic');
      process.exit(1);
    }

    // Update state
    const state = {
      count: 0,
      topic,
      error: '',
      generated_at: Date.now()
    };
    writeState(session_id, state);

    console.log(`Topic: ${topic}`);

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'unknown');
    process.exit(1);
  }
}

main();
