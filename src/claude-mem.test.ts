// src/claude-mem.test.ts
import { describe, expect, it } from 'vitest';
import { getClaudeMemContext } from './claude-mem.js';

describe('Claude-Mem Integration', () => {
  it('should return null when no memory_session_id found', async () => {
    const result = await getClaudeMemContext('nonexistent-session');
    expect(result).toBeNull();
  });

  // Skip actual DB test unless DB exists
  it.skip('should query observations from database', async () => {
    // This would require actual database setup
  });
});
