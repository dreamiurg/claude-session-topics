// src/state.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readState, writeState, getStatePath } from './state.js';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('State Management', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'claude-topic-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return null for non-existent state', () => {
    const state = readState('test-session-id', tempDir);
    expect(state).toBeNull();
  });

  it('should write and read state', () => {
    const sessionId = 'test-123';
    const state = {
      count: 5,
      topic: 'Test topic',
      error: '',
      generated_at: Date.now()
    };

    writeState(sessionId, state, tempDir);
    const read = readState(sessionId, tempDir);

    expect(read).toEqual(state);
  });
});
