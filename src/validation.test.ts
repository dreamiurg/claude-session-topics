// src/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateSessionId } from './validation';

describe('Validation', () => {
  describe('validateSessionId', () => {
    it('should accept valid UUID', () => {
      expect(validateSessionId('a1b2c3d4-e5f6-4789-a123-b456c789d012')).toBe(true);
    });

    it('should accept agent ID', () => {
      expect(validateSessionId('agent-abc1234')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(validateSessionId('invalid')).toBe(false);
      expect(validateSessionId('')).toBe(false);
      expect(validateSessionId('agent-')).toBe(false);
    });
  });
});
