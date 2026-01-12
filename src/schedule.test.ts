import { describe, it, expect } from 'vitest';
import { shouldGenerate, nextGenerationAt } from './schedule.js';

describe('Fibonacci Schedule', () => {
  describe('shouldGenerate', () => {
    it('should generate on Fibonacci thresholds', () => {
      expect(shouldGenerate(1, '')).toBe(true);
      expect(shouldGenerate(2, 'existing topic')).toBe(true);
      expect(shouldGenerate(3, 'existing topic')).toBe(true);
      expect(shouldGenerate(5, 'existing topic')).toBe(true);
      expect(shouldGenerate(8, 'existing topic')).toBe(true);
    });

    it('should not generate between thresholds', () => {
      expect(shouldGenerate(4, 'existing topic')).toBe(false);
      expect(shouldGenerate(6, 'existing topic')).toBe(false);
      expect(shouldGenerate(7, 'existing topic')).toBe(false);
    });

    it('should generate every 10 after 8', () => {
      expect(shouldGenerate(18, 'existing topic')).toBe(true);
      expect(shouldGenerate(28, 'existing topic')).toBe(true);
      expect(shouldGenerate(38, 'existing topic')).toBe(true);
    });

    it('should always generate when no topic', () => {
      expect(shouldGenerate(0, '')).toBe(true);
      expect(shouldGenerate(10, '')).toBe(true);
    });
  });

  describe('nextGenerationAt', () => {
    it('should return correct next threshold', () => {
      expect(nextGenerationAt(0)).toBe(1);
      expect(nextGenerationAt(1)).toBe(2);
      expect(nextGenerationAt(2)).toBe(3);
      expect(nextGenerationAt(4)).toBe(5);
      expect(nextGenerationAt(9)).toBe(18);
      expect(nextGenerationAt(20)).toBe(28);
    });
  });
});
