import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { TranscriptMessage, MessageContent } from './types';

export function findTranscriptPath(sessionId: string, cwd: string): string | null {
  const claudeProjects = join(homedir(), '.claude', 'projects');

  // Convert cwd to project dir format: /Users/foo/bar -> -Users-foo-bar
  const projectDir = cwd.replace(/^\//, '').replace(/\//g, '-');
  const prefixedDir = `-${projectDir}`;

  const transcriptPath = join(claudeProjects, prefixedDir, `${sessionId}.jsonl`);

  if (existsSync(transcriptPath)) {
    return transcriptPath;
  }

  return null;
}

async function waitForTranscriptContent(
  path: string,
  maxWaitMs = 2000
): Promise<boolean> {
  const startTime = Date.now();
  let prevSize = 0;

  while (Date.now() - startTime < maxWaitMs) {
    const stats = statSync(path);
    const currentSize = stats.size;

    if (currentSize > 0) {
      // Check if stable (not being written)
      if (currentSize === prevSize && prevSize > 0) {
        return true;
      }
      prevSize = currentSize;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return prevSize > 0;
}

function extractTextFromContent(content: string | MessageContent[]): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .filter(block => block.type === 'text')
      .map(block => block.text || '')
      .join(' ');
  }

  return '';
}

export async function parseTranscript(
  path: string,
  contextLines = 50
): Promise<string | null> {
  if (!existsSync(path)) {
    return null;
  }

  // Wait for transcript to be written
  const hasContent = await waitForTranscriptContent(path);
  if (!hasContent) {
    return null;
  }

  try {
    const content = readFileSync(path, 'utf-8');
    const lines = content.trim().split('\n');
    const recentLines = lines.slice(-contextLines);

    const messages: string[] = [];

    for (const line of recentLines) {
      try {
        const msg = JSON.parse(line) as TranscriptMessage;

        if (msg.type === 'user') {
          const text = extractTextFromContent(msg.message.content);
          if (text) {
            messages.push(`User: ${text.slice(0, 200)}`);
          }
        } else if (msg.type === 'assistant') {
          const text = extractTextFromContent(msg.message.content);
          if (text) {
            messages.push(`Claude: ${text.slice(0, 200)}`);
          }
        }
      } catch {
        // Skip invalid JSON lines
        continue;
      }
    }

    const context = messages.join('\n').slice(0, 5000);
    return context.length > 0 ? context : null;

  } catch {
    return null;
  }
}
