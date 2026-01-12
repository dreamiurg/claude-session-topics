// src/state.ts
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import type { SessionState } from './types.js';

const STATE_PREFIX = 'claude-topic-';

export function getStatePath(sessionId: string, dir?: string): string {
  const baseDir = dir || process.env.TMPDIR || tmpdir();
  return join(baseDir, `${STATE_PREFIX}${sessionId}.json`);
}

export function readState(sessionId: string, dir?: string): SessionState | null {
  const path = getStatePath(sessionId, dir);

  if (!existsSync(path)) {
    return null;
  }

  try {
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content) as SessionState;
  } catch {
    return null;
  }
}

export function writeState(sessionId: string, state: SessionState, dir?: string): void {
  const path = getStatePath(sessionId, dir);
  writeFileSync(path, JSON.stringify(state, null, 2));
}
