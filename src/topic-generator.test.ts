// src/topic-generator.test.ts
import { describe, it, expect, vi } from 'vitest';
import { generateTopic, buildPrompt } from './topic-generator';

describe('Topic Generation', () => {
  describe('buildPrompt', () => {
    it('should build claude-mem prompt', () => {
      const context = '[observation] Test: context';
      const prompt = buildPrompt('claude-mem', context);

      expect(prompt).toContain('session observations');
      expect(prompt).toContain(context);
    });

    it('should build transcript prompt', () => {
      const context = 'User: Hello\nClaude: Hi';
      const prompt = buildPrompt('transcript', context);

      expect(prompt).toContain('Recent conversation');
      expect(prompt).toContain(context);
    });
  });

  describe('generateTopic', () => {
    it.skip('should call claude CLI', async () => {
      // Requires actual claude CLI
    });
  });
});
