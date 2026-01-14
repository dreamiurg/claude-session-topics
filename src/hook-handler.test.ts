import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { handleStopHook } from './hook-handler.js';
import type { HookInput } from './types.js';

describe('Hook Handler', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'hook-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should increment count on first call', async () => {
    const input: HookInput = {
      session_id: 'a1b2c3d4-e5f6-4789-a123-b456c789d012',
      cwd: '/tmp',
      stop_hook_active: false,
      hook_event_name: 'Stop',
      permission_mode: 'default'
    };

    await handleStopHook(input, tempDir);

    const { readState } = await import('./state.js');
    const state = readState('a1b2c3d4-e5f6-4789-a123-b456c789d012', tempDir);

    expect(state?.count).toBe(1);
  });

  it('should process even when stop_hook_active is true', async () => {
    const input: HookInput = {
      session_id: 'a1b2c3d4-e5f6-4789-a123-b456c789d012',
      cwd: '/tmp',
      stop_hook_active: true,
      hook_event_name: 'Stop',
      permission_mode: 'default'
    };

    await handleStopHook(input, tempDir);

    const { readState } = await import('./state.js');
    const state = readState('a1b2c3d4-e5f6-4789-a123-b456c789d012', tempDir);

    // Should still create state (recursion prevented by no-hooks.json)
    expect(state?.count).toBe(1);
  });

  it('should skip invalid session ID', async () => {
    const input: HookInput = {
      session_id: 'invalid',
      cwd: '/tmp',
      stop_hook_active: false,
      hook_event_name: 'Stop',
      permission_mode: 'default'
    };

    await handleStopHook(input, tempDir);

    const { readState } = await import('./state.js');
    const state = readState('invalid', tempDir);

    expect(state).toBeNull();
  });

  it('should increment count on subsequent calls', async () => {
    const input: HookInput = {
      session_id: 'a1b2c3d4-e5f6-4789-a123-b456c789d012',
      cwd: '/tmp',
      stop_hook_active: false,
      hook_event_name: 'Stop',
      permission_mode: 'default'
    };

    const { readState } = await import('./state.js');

    // First call
    await handleStopHook(input, tempDir);
    let state = readState('a1b2c3d4-e5f6-4789-a123-b456c789d012', tempDir);
    expect(state?.count).toBe(1);

    // Second call
    await handleStopHook(input, tempDir);
    state = readState('a1b2c3d4-e5f6-4789-a123-b456c789d012', tempDir);
    expect(state?.count).toBe(2);

    // Third call
    await handleStopHook(input, tempDir);
    state = readState('a1b2c3d4-e5f6-4789-a123-b456c789d012', tempDir);
    expect(state?.count).toBe(3);
  });

  it('should not acquire lock when already locked', async () => {
    const input: HookInput = {
      session_id: 'a1b2c3d4-e5f6-4789-a123-b456c789d012',
      cwd: '/tmp',
      stop_hook_active: false,
      hook_event_name: 'Stop',
      permission_mode: 'default'
    };

    const { acquireLock, releaseLock } = await import('./lock.js');
    const { readState } = await import('./state.js');

    // Acquire lock manually to block the hook handler
    const release = await acquireLock('a1b2c3d4-e5f6-4789-a123-b456c789d012', tempDir);

    try {
      // First call - should trigger generation (count 1 is Fibonacci threshold)
      await handleStopHook(input, tempDir);
      const state = readState('a1b2c3d4-e5f6-4789-a123-b456c789d012', tempDir);

      // Should still increment count even when locked
      expect(state?.count).toBe(1);
    } finally {
      // Clean up the lock
      await releaseLock(release);
    }
  });
});
