// src/lock-edge-cases.test.ts

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { acquireLock, forceReleaseLock, getLockPath, isLocked, releaseLock } from './lock.js';

describe('Lock Edge Cases', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'lock-edge-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should acquire lock when available', async () => {
    const sessionId = 'test-123';

    const release = await acquireLock(sessionId, tempDir);

    expect(release).not.toBeNull();
    await releaseLock(release);
  });

  it('should fail to acquire when already locked', async () => {
    const sessionId = 'test-123';

    const release1 = await acquireLock(sessionId, tempDir, 500);
    const release2 = await acquireLock(sessionId, tempDir, 500);

    expect(release1).not.toBeNull();
    expect(release2).toBeNull();

    await releaseLock(release1);
  });

  it('should acquire lock after release', async () => {
    const sessionId = 'test-123';

    const release1 = await acquireLock(sessionId, tempDir);
    await releaseLock(release1);
    const release2 = await acquireLock(sessionId, tempDir);

    expect(release2).not.toBeNull();
    await releaseLock(release2);
  });

  it('should acquire stale lock (older than maxAge)', async () => {
    const sessionId = 'test-123';

    // Create a lock file manually (simulate orphaned lock)
    const lockPath = getLockPath(sessionId, tempDir);
    writeFileSync(lockPath, '');

    // Manually create a stale lock file by writing it
    // proper-lockfile will detect it as stale after the timeout

    // Should acquire the stale lock with short maxAge
    const release = await acquireLock(sessionId, tempDir, 100);

    expect(release).not.toBeNull();
    await releaseLock(release);
  });

  it('should detect locked state', async () => {
    const sessionId = 'test-123';

    const isLockedBefore = await isLocked(sessionId, tempDir);
    expect(isLockedBefore).toBe(false);

    const release = await acquireLock(sessionId, tempDir);
    const isLockedDuring = await isLocked(sessionId, tempDir);
    expect(isLockedDuring).toBe(true);

    await releaseLock(release);
    const isLockedAfter = await isLocked(sessionId, tempDir);
    expect(isLockedAfter).toBe(false);
  });

  it('should handle multiple concurrent lock attempts', async () => {
    const sessionId = 'test-123';

    // Try to acquire lock 10 times concurrently
    const attempts = await Promise.all(
      Array.from({ length: 10 }, () => acquireLock(sessionId, tempDir, 100))
    );

    // Only one should succeed
    const successes = attempts.filter((a) => a !== null);
    expect(successes.length).toBe(1);

    // Release the successful lock
    await releaseLock(successes[0]);
  });

  it('should handle release of null lock gracefully', async () => {
    // Should not throw
    await expect(releaseLock(null)).resolves.not.toThrow();
  });

  it('should handle different session IDs independently', async () => {
    const sessionId1 = 'test-123';
    const sessionId2 = 'test-456';

    const release1 = await acquireLock(sessionId1, tempDir);
    const release2 = await acquireLock(sessionId2, tempDir);

    // Both should succeed as they're different sessions
    expect(release1).not.toBeNull();
    expect(release2).not.toBeNull();

    await releaseLock(release1);
    await releaseLock(release2);
  });

  it('should force-release lock by session ID', async () => {
    const sessionId = 'test-123';

    const release = await acquireLock(sessionId, tempDir);
    expect(release).not.toBeNull();

    // Force-release using session ID (simulating background process cleanup)
    await forceReleaseLock(sessionId, tempDir);

    // Should be able to acquire again
    const release2 = await acquireLock(sessionId, tempDir);
    expect(release2).not.toBeNull();
    await releaseLock(release2);
  });
});
