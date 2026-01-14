// src/lock.test.ts

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { acquireLock, releaseLock } from './lock.js';

describe('Lock Management', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'claude-lock-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should acquire lock when available', async () => {
    const release = await acquireLock('test-session', tempDir);
    expect(release).not.toBeNull();
    await releaseLock(release);
  });

  it('should fail to acquire when locked', async () => {
    const release1 = await acquireLock('test-session', tempDir, 100);
    expect(release1).not.toBeNull();

    // Try to acquire again - should fail
    const release2 = await acquireLock('test-session', tempDir, 100);
    expect(release2).toBeNull();

    await releaseLock(release1);
  });

  it('should acquire after release', async () => {
    const release1 = await acquireLock('test-session', tempDir);
    expect(release1).not.toBeNull();

    await releaseLock(release1);

    const release2 = await acquireLock('test-session', tempDir);
    expect(release2).not.toBeNull();
    await releaseLock(release2);
  });
});
