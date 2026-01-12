// src/display.test.ts
import { describe, it, expect } from 'vitest';
import { formatTopicDisplay, formatAge } from './display.js';
import type { SessionState } from './types.js';

describe('Topic Display', () => {
  describe('formatAge', () => {
    it('should format recent as "now"', () => {
      const now = Date.now();
      expect(formatAge(now)).toBe('now');
      expect(formatAge(now - 200 * 1000)).toBe('now');
    });

    it('should format older timestamps', () => {
      const now = Date.now();
      expect(formatAge(now - 600 * 1000)).toBe('~10m');
      expect(formatAge(now - 3600 * 1000)).toBe('~1h');
      expect(formatAge(now - 7200 * 1000)).toBe('~2h');
    });
  });

  describe('formatTopicDisplay', () => {
    it('should show "after 1 message" when no state', () => {
      expect(formatTopicDisplay(null)).toBe('Topic: after 1 message');
    });

    it('should show topic with age', () => {
      const state: SessionState = {
        count: 5,
        topic: 'Test topic',
        error: '',
        generated_at: Date.now()
      };

      const display = formatTopicDisplay(state);
      expect(display).toBe('Test topic (now)');
    });

    it('should show countdown when no topic', () => {
      const state: SessionState = {
        count: 4,
        topic: '',
        error: '',
        generated_at: Date.now()
      };

      expect(formatTopicDisplay(state)).toBe('Topic: in 1 messages');
    });
  });
});
