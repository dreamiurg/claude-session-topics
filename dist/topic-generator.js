// src/topic-generator.ts
import { appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import removeMd from 'remove-markdown';
function log(message, data) {
    try {
        const logPath = join(tmpdir(), 'claude-topic-generator.log');
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` ${JSON.stringify(data)}` : '';
        appendFileSync(logPath, `[${timestamp}] ${message}${dataStr}\n`);
    }
    catch {
        // Ignore logging errors
    }
}
/**
 * Remove markdown formatting from topic text for clean status line display
 */
function sanitizeMarkdown(text) {
    // Use remove-markdown package instead of DIY regex patterns
    return removeMd(text, {
        stripListLeaders: true,
        gfm: true,
        useImgAltText: false
    }).trim();
}
export function buildPrompt(source, context, previousTopic) {
    const sourceLabel = source === 'claude-mem' ? 'session observations' : 'Claude Code session';
    const contextLabel = source === 'claude-mem' ? 'Session observations' : 'Recent conversation';
    // If we have a previous topic, extract theme and ask AI to preserve it unless session shifted
    const continuityInstructions = previousTopic
        ? `\nPrevious topic: "${previousTopic}"

IMPORTANT: Keep the THEME (first part before ":") STABLE unless the session has fundamentally shifted to a different area of work. Only update the ACTIVITY (part after ":") to reflect current focus. The theme should span multiple generations and capture the meta-level work, while activity captures what's happening right now.

If the session is still working on the same general area (same theme), preserve that theme exactly and only update the activity. Only change the theme if the work has moved to a completely different area.`
        : '\nThis is the first topic generation. Choose a theme that will be stable across multiple work items.';
    return `Based on these ${sourceLabel}, generate a terse topic line.

Format: "<theme>: <activity>" where:
- THEME: Meta-level area of work (2-4 words). Should be STABLE across multiple generations.
- ACTIVITY: Current specific focus (2-3 words max gerund phrase, e.g., "fixing tests", "adding auth")${continuityInstructions}

Examples:
- Database migration: updating schema
- API endpoints: fixing validation
- React components: adding hooks
- TypeScript: refactoring types

${contextLabel}:
${context}

Topic:`;
}
export async function generateTopic(context, source, previousTopic, timeoutMs = 30000) {
    try {
        log('generateTopic called', {
            source,
            contextLength: context.length,
            previousTopic,
            timeoutMs
        });
        const prompt = buildPrompt(source, context, previousTopic);
        log('Prompt built', { promptLength: prompt.length });
        // Escape single quotes in the prompt for shell safety
        const escapedPrompt = prompt.replace(/'/g, "'\\''");
        // Determine path to no-hooks.json
        // In production: use CLAUDE_PLUGIN_ROOT
        // In testing: resolve relative to this file
        const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
        let settingsPath;
        if (pluginRoot) {
            settingsPath = `${pluginRoot}/no-hooks.json`;
            log('Using production settings path', { settingsPath });
        }
        else {
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
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        log('ERROR in generateTopic', { error: errorMsg });
        return null;
    }
}
//# sourceMappingURL=topic-generator.js.map
