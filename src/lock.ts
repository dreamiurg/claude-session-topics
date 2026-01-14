// src/lock.ts

import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { check, lock, unlock } from 'proper-lockfile';

const LOCK_PREFIX = 'claude-topic-';
const LOCK_SUFFIX = '.lock';

export function getLockPath(sessionId: string, dir?: string): string {
  const baseDir = dir || process.env.TMPDIR || tmpdir();
  return join(baseDir, `${LOCK_PREFIX}${sessionId}${LOCK_SUFFIX}`);
}

/**
 * Acquire a lock for the given session
 * @returns Release function to unlock, or null if lock could not be acquired
 */
export async function acquireLock(
  sessionId: string,
  dir?: string,
  maxAge = 60000
): Promise<(() => Promise<void>) | null> {
  const lockPath = getLockPath(sessionId, dir);

  // proper-lockfile requires the file to exist
  try {
    writeFileSync(lockPath, '');
  } catch (_err) {
    // If we can't create the file, create parent directory first
    try {
      const parentDir = dir || process.env.TMPDIR || tmpdir();
      mkdirSync(parentDir, { recursive: true });
      writeFileSync(lockPath, '');
    } catch {
      return null;
    }
  }

  try {
    const release = await lock(lockPath, {
      stale: maxAge, // Auto-break stale locks
      retries: {
        retries: 3, // Retry 3 times
        minTimeout: 50, // Start at 50ms
        maxTimeout: 1000 // Cap at 1s
      },
      realpath: false // Faster, no symlink resolution
    });

    return release;
  } catch {
    // Lock acquisition failed (timeout, permissions, etc)
    return null;
  }
}

/**
 * Release a lock using the release function
 */
export async function releaseLock(release: (() => Promise<void>) | null): Promise<void> {
  if (!release) return;

  try {
    await release();
  } catch {
    // Lock may already be released, ignore errors
  }
}

/**
 * Check if a lock is currently held
 */
export async function isLocked(sessionId: string, dir?: string): Promise<boolean> {
  const lockPath = getLockPath(sessionId, dir);

  try {
    return await check(lockPath);
  } catch {
    return false;
  }
}

/**
 * Force-release a lock by session ID (for background processes)
 * This directly unlocks without needing the release function
 */
export async function forceReleaseLock(sessionId: string, dir?: string): Promise<void> {
  const lockPath = getLockPath(sessionId, dir);

  try {
    // Directly unlock the file using proper-lockfile's unlock function
    await unlock(lockPath, {
      realpath: false
    });
  } catch {
    // Lock doesn't exist or couldn't be released, that's fine
  }
}
