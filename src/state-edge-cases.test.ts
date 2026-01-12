// src/state-edge-cases.test.ts

import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getStatePath, readState, writeState } from './state.js';

describe('State Edge Cases', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'state-edge-test-'));
  });

  afterEach(() => {
    // Restore permissions before cleanup
    try {
      chmodSync(tempDir, 0o755);
    } catch {
      // Ignore
    }
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should handle corrupted JSON state file', () => {
    const sessionId = 'test-123';
    const path = getStatePath(sessionId, tempDir);

    // Write invalid JSON
    writeFileSync(path, '{ invalid json }');

    const state = readState(sessionId, tempDir);

    // Should return null for corrupted files
    expect(state).toBeNull();
  });

  it('should handle empty state file', () => {
    const sessionId = 'test-123';
    const path = getStatePath(sessionId, tempDir);

    // Write empty file
    writeFileSync(path, '');

    const state = readState(sessionId, tempDir);

    // Should return null for empty files
    expect(state).toBeNull();
  });

  it('should handle state file with missing fields', () => {
    const sessionId = 'test-123';
    const path = getStatePath(sessionId, tempDir);

    // Write partial state
    writeFileSync(path, JSON.stringify({ count: 5 }));

    const state = readState(sessionId, tempDir);

    // Should still parse but have incomplete data
    expect(state).toBeTruthy();
    expect(state?.count).toBe(5);
  });

  it('should handle very large count values', () => {
    const sessionId = 'test-123';
    const largeState = {
      count: 999999999,
      topic: 'Test topic',
      error: '',
      generated_at: Date.now()
    };

    writeState(sessionId, largeState, tempDir);
    const read = readState(sessionId, tempDir);

    expect(read?.count).toBe(999999999);
  });

  it('should handle very long topic strings', () => {
    const sessionId = 'test-123';
    const longTopic = 'A'.repeat(10000);
    const state = {
      count: 1,
      topic: longTopic,
      error: '',
      generated_at: Date.now()
    };

    writeState(sessionId, state, tempDir);
    const read = readState(sessionId, tempDir);

    expect(read?.topic).toBe(longTopic);
    expect(read?.topic.length).toBe(10000);
  });

  it('should handle special characters in topic', () => {
    const sessionId = 'test-123';
    const specialTopic = '"Test"\n\t\\Special: chars & <html> 中文';
    const state = {
      count: 1,
      topic: specialTopic,
      error: '',
      generated_at: Date.now()
    };

    writeState(sessionId, state, tempDir);
    const read = readState(sessionId, tempDir);

    expect(read?.topic).toBe(specialTopic);
  });

  it('should handle Unicode emoji in topic', () => {
    const sessionId = 'test-123';
    const emojiTopic = '🚀 Debugging API endpoints 🐛';
    const state = {
      count: 1,
      topic: emojiTopic,
      error: '',
      generated_at: Date.now()
    };

    writeState(sessionId, state, tempDir);
    const read = readState(sessionId, tempDir);

    expect(read?.topic).toBe(emojiTopic);
  });
});
