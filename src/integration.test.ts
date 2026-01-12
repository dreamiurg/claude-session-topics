import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { handleStopHook } from './hook-handler';
import { readState } from './state';
import { formatTopicDisplay } from './display';
import type { HookInput } from './types';

describe('Integration Tests', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'integration-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should handle full hook lifecycle', async () => {
    const sessionId = 'a1b2c3d4-e5f6-4789-a123-b456c789d012';

    const input: HookInput = {
      session_id: sessionId,
      cwd: '/tmp/test',
      stop_hook_active: false,
      hook_event_name: 'Stop',
      permission_mode: 'default'
    };

    // First call - count should be 1
    await handleStopHook(input, tempDir);
    let state = readState(sessionId, tempDir);
    expect(state?.count).toBe(1);
    expect(formatTopicDisplay(state)).toBe('Topic: in 1 messages');

    // Second call - count should be 2, at Fibonacci threshold
    await handleStopHook(input, tempDir);
    state = readState(sessionId, tempDir);
    expect(state?.count).toBe(2);

    // Third call
    await handleStopHook(input, tempDir);
    state = readState(sessionId, tempDir);
    expect(state?.count).toBe(3);

    // Fourth call (not a threshold)
    await handleStopHook(input, tempDir);
    state = readState(sessionId, tempDir);
    expect(state?.count).toBe(4);

    // Fifth call (Fibonacci threshold)
    await handleStopHook(input, tempDir);
    state = readState(sessionId, tempDir);
    expect(state?.count).toBe(5);
  });

  it('should skip when stop_hook_active is true', async () => {
    const sessionId = 'a1b2c3d4-e5f6-4789-a123-b456c789d012';

    const input: HookInput = {
      session_id: sessionId,
      cwd: '/tmp/test',
      stop_hook_active: true,
      hook_event_name: 'Stop',
      permission_mode: 'default'
    };

    await handleStopHook(input, tempDir);
    const state = readState(sessionId, tempDir);

    // State should not be created when stop_hook_active is true
    expect(state).toBeNull();
  });

  it('should skip when session ID is invalid', async () => {
    const input: HookInput = {
      session_id: 'invalid-session-id',
      cwd: '/tmp/test',
      stop_hook_active: false,
      hook_event_name: 'Stop',
      permission_mode: 'default'
    };

    await handleStopHook(input, tempDir);
    const state = readState('invalid-session-id', tempDir);

    // State should not be created for invalid session ID
    expect(state).toBeNull();
  });

  it('should handle agent IDs', async () => {
    const sessionId = 'agent-abc1234';

    const input: HookInput = {
      session_id: sessionId,
      cwd: '/tmp/test',
      stop_hook_active: false,
      hook_event_name: 'Stop',
      permission_mode: 'default'
    };

    await handleStopHook(input, tempDir);
    const state = readState(sessionId, tempDir);

    expect(state?.count).toBe(1);
  });

  it('should increment count across multiple calls', async () => {
    const sessionId = 'a1b2c3d4-e5f6-4789-a123-b456c789d012';

    const input: HookInput = {
      session_id: sessionId,
      cwd: '/tmp/test',
      stop_hook_active: false,
      hook_event_name: 'Stop',
      permission_mode: 'default'
    };

    // Call 8 times to reach end of Fibonacci sequence
    for (let i = 1; i <= 8; i++) {
      await handleStopHook(input, tempDir);
      const state = readState(sessionId, tempDir);
      expect(state?.count).toBe(i);
    }
  });

  it('should show correct display formatting', async () => {
    const sessionId = 'a1b2c3d4-e5f6-4789-a123-b456c789d012';

    const input: HookInput = {
      session_id: sessionId,
      cwd: '/tmp/test',
      stop_hook_active: false,
      hook_event_name: 'Stop',
      permission_mode: 'default'
    };

    // First call
    await handleStopHook(input, tempDir);
    let state = readState(sessionId, tempDir);
    expect(formatTopicDisplay(state)).toBe('Topic: in 1 messages');

    // Call until count is 4 (between thresholds)
    await handleStopHook(input, tempDir);
    await handleStopHook(input, tempDir);
    await handleStopHook(input, tempDir);
    state = readState(sessionId, tempDir);
    expect(formatTopicDisplay(state)).toBe('Topic: in 1 messages');
  });
});
