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
