// src/cli.test.ts

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('CLI Entry Points', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'cli-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should handle valid hook input via stdin', async () => {
    const sessionId = 'a1b2c3d4-e5f6-4789-a123-b456c789d012';
    const input = JSON.stringify({
      session_id: sessionId,
      cwd: '/tmp',
      stop_hook_active: false,
      hook_event_name: 'Stop',
      permission_mode: 'default'
    });

    const cli = spawn('node', ['dist/cli.js'], {
      env: { ...process.env, TMPDIR: tempDir }
    });

    cli.stdin.write(input);
    cli.stdin.end();

    await new Promise<void>((resolve) => {
      cli.on('close', (code) => {
        expect(code).toBe(0);
        resolve();
      });
    });
  });

  it('should handle malformed JSON gracefully', async () => {
    const cli = spawn('node', ['dist/cli.js']);

    cli.stdin.write('not valid json');
    cli.stdin.end();

    let stderr = '';
    cli.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    await new Promise<void>((resolve) => {
      cli.on('close', (code) => {
        // Should exit cleanly without errors (silent failure for hooks)
        expect(code).toBe(0);
        expect(stderr).toBe('');
        resolve();
      });
    });
  });

  it('should handle empty stdin gracefully', async () => {
    const cli = spawn('node', ['dist/cli.js']);

    cli.stdin.end();

    await new Promise<void>((resolve) => {
      cli.on('close', (code) => {
        // Should exit cleanly
        expect(code).toBe(0);
        resolve();
      });
    });
  });

  it('should handle missing required fields', async () => {
    const input = JSON.stringify({
      // Missing session_id
      cwd: '/tmp',
      stop_hook_active: false
    });

    const cli = spawn('node', ['dist/cli.js']);

    cli.stdin.write(input);
    cli.stdin.end();

    await new Promise<void>((resolve) => {
      cli.on('close', (code) => {
        // Should exit cleanly without creating state
        expect(code).toBe(0);
        resolve();
      });
    });
  });

  it('cli-display should handle non-existent session', async () => {
    const sessionId = 'a1b2c3d4-e5f6-4789-a123-b456c789d012';

    const cli = spawn('node', ['dist/cli-display.js', sessionId], {
      env: { ...process.env, TMPDIR: tempDir }
    });

    let stdout = '';
    let _stderr = '';
    cli.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    cli.stderr.on('data', (data) => {
      _stderr += data.toString();
    });

    await new Promise<void>((resolve) => {
      cli.on('close', (code) => {
        expect(code).toBe(0);
        // Should either show default message or empty (depends on timing)
        if (stdout.trim()) {
          expect(stdout.trim()).toMatch(/Topic:|after/);
        }
        resolve();
      });
    });
  });

  it('cli-force-topic should handle missing session gracefully', async () => {
    const sessionId = 'a1b2c3d4-e5f6-4789-a123-b456c789d012';

    const cli = spawn('node', ['dist/cli-force-topic.js', sessionId], {
      env: { ...process.env, TMPDIR: tempDir }
    });

    let stderr = '';
    cli.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    await new Promise<void>((resolve) => {
      cli.on('close', (code) => {
        // Should fail with non-zero exit code
        expect(code).not.toBe(0);
        // Should have some error message (either about context or resource)
        expect(stderr.length).toBeGreaterThan(0);
        resolve();
      });
    });
  });
});
