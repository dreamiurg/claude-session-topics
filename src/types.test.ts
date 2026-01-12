// src/types.test.ts
import { describe, it, expect } from 'vitest';
import type { SessionState } from './types.js';

describe('SessionState', () => {
  it('should have required fields', () => {
    const state: SessionState = {
      count: 1,
      topic: 'Test topic',
      error: '',
      generated_at: Date.now()
    };

    expect(state.count).toBe(1);
    expect(state.topic).toBe('Test topic');
  });
});
