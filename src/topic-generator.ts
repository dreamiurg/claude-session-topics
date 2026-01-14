// src/topic-generator.ts
import { appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import removeMd from 'remove-markdown';

function log(message: string, data?: unknown) {
  try {
    const logPath = join(tmpdir(), 'claude-topic-generator.log');
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    appendFileSync(logPath, `[${timestamp}] ${message}${dataStr}\n`);
  } catch {
    // Ignore logging errors
  }
}

/**
 * Remove markdown formatting from topic text for clean status line display
 */
function sanitizeMarkdown(text: string): string {
  // Use remove-markdown package instead of DIY regex patterns
  return removeMd(text, {
    stripListLeaders: true,
    gfm: true,
    useImgAltText: false
  }).trim();
}

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
  timeoutMs = 30000
): Promise<string | null> {
  try {
    log('generateTopic called', { source, contextLength: context.length, timeoutMs });

    const prompt = buildPrompt(source, context);
    log('Prompt built', { promptLength: prompt.length });

    // Escape single quotes in the prompt for shell safety
    const escapedPrompt = prompt.replace(/'/g, "'\\''");

    // Determine path to no-hooks.json
    // In production: use CLAUDE_PLUGIN_ROOT
    // In testing: resolve relative to this file
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
    let settingsPath: string;

    if (pluginRoot) {
      settingsPath = `${pluginRoot}/no-hooks.json`;
      log('Using production settings path', { settingsPath });
    } else {
      // Testing mode: resolve relative to dist directory
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const projectRoot = join(__dirname, '..');
      settingsPath = join(projectRoot, 'no-hooks.json');
      log('Using test settings path', { settingsPath });
    }

    // Use the same approach as the working bash script
    // NOTE: The --tools "" flag is crucial - without it, the command hangs
    // CRITICAL: --settings with disableAllHooks prevents infinite recursion if this runs from a Stop hook
    const command = `printf '%s' '${escapedPrompt}' | claude --model haiku --print --no-session-persistence --settings "${settingsPath}" --tools "" 2>/dev/null | head -1`;
    log('Executing claude command', { command: command.substring(0, 200) });

    const { execSync } = await import('node:child_process');
    const result = execSync(command, {
      encoding: 'utf-8',
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024,
      shell: '/bin/bash'
    });

    log('Command completed', { resultLength: result.length });

    const rawTopic = result.trim();
    const topic = rawTopic ? sanitizeMarkdown(rawTopic) : null;
    log('Topic extracted', { rawTopic, sanitizedTopic: topic, topicLength: topic?.length });

    return topic;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log('ERROR in generateTopic', { error: errorMsg });
    return null;
  }
}
