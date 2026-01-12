// src/lock.ts
import { existsSync, mkdirSync, rmdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const LOCK_PREFIX = 'claude-topic-';
const LOCK_SUFFIX = '.lock';

export function getLockPath(sessionId: string, dir?: string): string {
  const baseDir = dir || process.env.TMPDIR || tmpdir();
  return join(baseDir, `${LOCK_PREFIX}${sessionId}${LOCK_SUFFIX}`);
}

export function acquireLock(sessionId: string, dir?: string, maxAge = 60): boolean {
  const lockPath = getLockPath(sessionId, dir);

  try {
    // Try to create lock directory atomically
    mkdirSync(lockPath);
    return true;
  } catch {
    // Lock exists - check if stale
    if (existsSync(lockPath)) {
      const stats = statSync(lockPath);
      const age = (Date.now() - stats.mtimeMs) / 1000;

      if (age >= maxAge) {
        // Stale lock - try to break and acquire
        try {
          rmdirSync(lockPath);
          mkdirSync(lockPath);
          return true;
        } catch {
          return false;
        }
      }
    }
    return false;
  }
}

export function releaseLock(sessionId: string, dir?: string): void {
  const lockPath = getLockPath(sessionId, dir);
  try {
    rmdirSync(lockPath);
  } catch {
    // Ignore errors - lock may not exist
  }
}
