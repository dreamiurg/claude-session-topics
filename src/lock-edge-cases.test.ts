// src/lock-edge-cases.test.ts

import { mkdirSync, mkdtempSync, rmSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { acquireLock, getLockPath, releaseLock } from './lock.js';

describe('Lock Edge Cases', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'lock-edge-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should acquire lock when available', () => {
    const sessionId = 'test-123';

    const acquired = acquireLock(sessionId, tempDir);

    expect(acquired).toBe(true);
    releaseLock(sessionId, tempDir);
  });

  it('should fail to acquire when already locked', () => {
    const sessionId = 'test-123';

    const first = acquireLock(sessionId, tempDir);
    const second = acquireLock(sessionId, tempDir);

    expect(first).toBe(true);
    expect(second).toBe(false);

    releaseLock(sessionId, tempDir);
  });

  it('should acquire lock after release', () => {
    const sessionId = 'test-123';

    acquireLock(sessionId, tempDir);
    releaseLock(sessionId, tempDir);
    const reacquired = acquireLock(sessionId, tempDir);

    expect(reacquired).toBe(true);
    releaseLock(sessionId, tempDir);
  });

  it('should acquire stale lock (older than maxAge)', async () => {
    const sessionId = 'test-123';
    const lockPath = getLockPath(sessionId, tempDir);

    // Create a stale lock manually
    mkdirSync(lockPath);

    // Set modification time to 2 minutes ago (stale)
    const twoMinutesAgo = Date.now() - 120 * 1000;
    utimesSync(lockPath, new Date(twoMinutesAgo), new Date(twoMinutesAgo));

    // Should acquire the stale lock with maxAge of 60 seconds
    const acquired = acquireLock(sessionId, tempDir, 60);

    expect(acquired).toBe(true);
    releaseLock(sessionId, tempDir);
  });

  it('should not acquire recent lock', async () => {
    const sessionId = 'test-123';
    const lockPath = getLockPath(sessionId, tempDir);

    // Create a recent lock manually
    mkdirSync(lockPath);

    // Lock is fresh, should not be acquired
    const acquired = acquireLock(sessionId, tempDir, 60);

    expect(acquired).toBe(false);

    rmSync(lockPath, { recursive: true, force: true });
  });

  it('should handle multiple concurrent lock attempts', () => {
    const sessionId = 'test-123';
    const attempts: boolean[] = [];

    // Try to acquire lock 10 times
    for (let i = 0; i < 10; i++) {
      attempts.push(acquireLock(sessionId, tempDir));
    }

    // Only one should succeed
    const successes = attempts.filter((a) => a === true);
    expect(successes.length).toBe(1);

    releaseLock(sessionId, tempDir);
  });

  it('should handle release of non-existent lock gracefully', () => {
    const sessionId = 'test-123';

    // Should not throw
    expect(() => releaseLock(sessionId, tempDir)).not.toThrow();
  });

  it('should handle different session IDs independently', () => {
    const sessionId1 = 'test-123';
    const sessionId2 = 'test-456';

    const lock1 = acquireLock(sessionId1, tempDir);
    const lock2 = acquireLock(sessionId2, tempDir);

    // Both should succeed as they're different sessions
    expect(lock1).toBe(true);
    expect(lock2).toBe(true);

    releaseLock(sessionId1, tempDir);
    releaseLock(sessionId2, tempDir);
  });
});
