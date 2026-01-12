// src/topic-generator.ts
import { $ } from 'zx';

export function buildPrompt(source: 'claude-mem' | 'transcript', context: string): string {
  const sourceLabel = source === 'claude-mem' ? 'session observations' : 'Claude Code session';
  const contextLabel = source === 'claude-mem' ? 'Session observations' : 'Recent conversation';

  return `Based on these ${sourceLabel}, generate a terse topic line.

Format: "<topic>: <activity>" where:
- Topic captures the overall theme (2-4 words)
- Activity is a SHORT gerund phrase (2-3 words max, e.g., "fixing tests", "adding auth")

Examples:
- Database migration: updating schema
- API endpoints: fixing validation
- React components: adding hooks
- TypeScript: refactoring types

${contextLabel}:
${context}

Topic:`;
}

export async function generateTopic(
  context: string,
  source: 'claude-mem' | 'transcript',
  timeoutSec = 30
): Promise<string | null> {
  try {
    $.verbose = false;

    const prompt = buildPrompt(source, context);

    // Use timeout command if available
    let command = 'claude';
    try {
      await $`which timeout`;
      command = `timeout ${timeoutSec}`;
    } catch {
      try {
        await $`which gtimeout`;
        command = `gtimeout ${timeoutSec}`;
      } catch {
        // No timeout available
      }
    }

    const fullCommand =
      command === 'claude'
        ? ['claude', '--model', 'haiku', '--print', '--no-session-persistence', '--tools', '']
        : [
            command,
            String(timeoutSec),
            'claude',
            '--model',
            'haiku',
            '--print',
            '--no-session-persistence',
            '--tools',
            ''
          ];

    const result = await $`echo ${prompt} | ${fullCommand}`;
    const topic = result.stdout.trim().split('\n')[0];

    return topic || null;
  } catch {
    return null;
  }
}
