// src/lock.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { acquireLock, releaseLock, getLockPath } from './lock';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Lock Management', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'claude-lock-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should acquire lock when available', () => {
    const result = acquireLock('test-session', tempDir);
    expect(result).toBe(true);
  });

  it('should fail to acquire when locked', () => {
    acquireLock('test-session', tempDir);
    const result = acquireLock('test-session', tempDir);
    expect(result).toBe(false);
  });

  it('should acquire after release', () => {
    acquireLock('test-session', tempDir);
    releaseLock('test-session', tempDir);
    const result = acquireLock('test-session', tempDir);
    expect(result).toBe(true);
  });
});
