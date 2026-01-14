// src/display.test.ts
import { describe, expect, it } from 'vitest';
import { formatTopicDisplay } from './display.js';
import type { SessionState } from './types.js';

describe('Topic Display', () => {
  describe('formatTopicDisplay', () => {
    it('should show conversational message when no state', () => {
      expect(formatTopicDisplay(null)).toBe('○ Just getting started...');
    });

    it('should show topic with circle progress (no age)', () => {
      const state: SessionState = {
        count: 5,
        topic: 'Test topic',
        error: '',
        generated_at: Date.now()
      };

      const display = formatTopicDisplay(state);
      // Should have circle + topic, no age
      expect(display).toMatch(/^[○◔◑◕●] Test topic$/);
    });

    it('should show conversational message when no topic yet', () => {
      const state: SessionState = {
        count: 1,
        topic: '',
        error: '',
        generated_at: Date.now()
      };

      const display = formatTopicDisplay(state);
      // Should have circle + conversational message
      expect(display).toMatch(/^[○◔◑◕●] .+$/);
      expect(display).not.toContain('Topic:');
    });

    it('should show error when present', () => {
      const state: SessionState = {
        count: 5,
        topic: '',
        error: 'Something went wrong',
        generated_at: Date.now()
      };

      expect(formatTopicDisplay(state)).toBe('⚠️ Something went wrong');
    });

    it('should not show "waiting for conversation" error', () => {
      const state: SessionState = {
        count: 0,
        topic: '',
        error: 'waiting for conversation',
        generated_at: Date.now()
      };

      const display = formatTopicDisplay(state);
      expect(display).not.toContain('⚠️');
    });
  });
});
