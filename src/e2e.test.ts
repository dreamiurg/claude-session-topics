import { execSync, spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * End-to-end tests that run the actual compiled CLI artifacts.
 * These tests would have caught all 3 production bugs:
 * 1. Missing matcher field in hooks.json
 * 2. Synchronous stdin reading race condition
 * 3. process.stdin.isTTY === false vs !== true
 */
describe('E2E: Compiled CLI Artifacts', () => {
  beforeAll(() => {
    // Ensure project is built
    execSync('npm run build', { stdio: 'inherit' });
  });

  describe('hooks.json structure validation', () => {
    it('should have valid hooks.json with required fields', () => {
      const hooksPath = 'hooks/hooks.json';
      expect(existsSync(hooksPath)).toBe(true);

      const hooks = JSON.parse(readFileSync(hooksPath, 'utf-8'));

      // Validate structure
      expect(hooks).toHaveProperty('hooks');
      expect(hooks.hooks).toHaveProperty('Stop');
      expect(Array.isArray(hooks.hooks.Stop)).toBe(true);

      // Validate each Stop hook has required fields
      for (const hook of hooks.hooks.Stop) {
        expect(hook).toHaveProperty('matcher');
        expect(hook).toHaveProperty('hooks');
        expect(Array.isArray(hook.hooks)).toBe(true);
        expect(hook.hooks.length).toBeGreaterThan(0);

        // Validate hook definitions
        for (const hookDef of hook.hooks) {
          expect(hookDef).toHaveProperty('type');
          expect(hookDef).toHaveProperty('command');
        }
      }
    });
  });

  describe('Stop hook CLI execution', () => {
    it('should complete within 2 seconds and exit with code 0', async () => {
      const input = JSON.stringify({
        session_id: 'e2e-test-stop-hook',
        cwd: '/tmp',
        stop_hook_active: false,
        hook_event_name: 'Stop',
        permission_mode: 'default'
      });

      const startTime = Date.now();

      const exitCode = await new Promise<number>((resolve) => {
        const child = spawn('bash', ['-c', `echo '${input}' | cat | node dist/cli.js`]);

        child.on('exit', (code) => {
          resolve(code ?? 1);
        });
      });

      const duration = Date.now() - startTime;

      expect(exitCode).toBe(0);
      expect(duration).toBeLessThan(2000);
    });

    it('should handle piped stdin without race conditions', async () => {
      const input = JSON.stringify({
        session_id: 'e2e-test-piped-stdin',
        cwd: '/tmp',
        stop_hook_active: false,
        hook_event_name: 'Stop',
        permission_mode: 'default'
      });

      // Run 10 times to catch race conditions
      const results = await Promise.all(
        Array.from({ length: 10 }, async () => {
          return new Promise<number>((resolve) => {
            const child = spawn('bash', ['-c', `echo '${input}' | cat | node dist/cli.js`]);
            child.on('exit', (code) => resolve(code ?? 1));
          });
        })
      );

      // All runs should succeed
      for (const exitCode of results) {
        expect(exitCode).toBe(0);
      }
    });

    it('should handle empty stdin gracefully', async () => {
      const exitCode = await new Promise<number>((resolve) => {
        const child = spawn('bash', ['-c', 'echo "" | node dist/cli.js']);
        child.on('exit', (code) => resolve(code ?? 1));
      });

      expect(exitCode).toBe(0);
    });

    it('should handle invalid JSON and exit with code 1', async () => {
      const exitCode = await new Promise<number>((resolve) => {
        const child = spawn('bash', ['-c', 'echo "invalid json" | node dist/cli.js']);
        child.on('exit', (code) => resolve(code ?? 0));
      });

      expect(exitCode).toBe(1);
    });
  });

  describe('Display CLI execution', () => {
    it('should work with command line argument', async () => {
      const result = await new Promise<{ code: number; stdout: string }>((resolve) => {
        const child = spawn('node', ['dist/cli-display.js', 'test-session-id']);

        let stdout = '';
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.on('exit', (code) => {
          resolve({ code: code ?? 1, stdout });
        });
      });

      expect(result.code).toBe(0);
      // Empty output is valid for non-existent session
      expect(result.stdout).not.toContain('[Exit: 1]');
      expect(result.stdout).not.toContain('Error');
    });

    it('should work with piped JSON input (ccstatusline simulation)', async () => {
      const input = JSON.stringify({ session_id: 'test-display-session' });

      const result = await new Promise<{ code: number; stdout: string }>((resolve) => {
        const child = spawn('bash', ['-c', `echo '${input}' | node dist/cli-display.js`]);

        let stdout = '';
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.on('exit', (code) => {
          resolve({ code: code ?? 1, stdout });
        });
      });

      expect(result.code).toBe(0);
      // Empty output is valid for non-existent session
      expect(result.stdout).not.toContain('[Exit: 1]');
      expect(result.stdout).not.toContain('Error');
    });

    it('should work with cat pipe (production scenario)', async () => {
      const input = JSON.stringify({ session_id: 'test-cat-pipe' });

      const result = await new Promise<{ code: number; stdout: string }>((resolve) => {
        const child = spawn('bash', ['-c', `echo '${input}' | cat | node dist/cli-display.js`]);

        let stdout = '';
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.on('exit', (code) => {
          resolve({ code: code ?? 1, stdout });
        });
      });

      expect(result.code).toBe(0);
      // Empty output is valid for non-existent session
      expect(result.stdout).not.toContain('[Exit: 1]');
      expect(result.stdout).not.toContain('Error');
    });

    it('should handle stdin with undefined isTTY correctly', async () => {
      // When stdin is piped, process.stdin.isTTY is undefined (not false)
      const input = JSON.stringify({ session_id: 'test-undefined-tty' });

      // Run multiple times to ensure consistency
      const results = await Promise.all(
        Array.from({ length: 5 }, async () => {
          return new Promise<number>((resolve) => {
            const child = spawn('bash', ['-c', `echo '${input}' | node dist/cli-display.js`]);
            child.on('exit', (code) => resolve(code ?? 1));
          });
        })
      );

      // All runs should succeed
      for (const exitCode of results) {
        expect(exitCode).toBe(0);
      }
    });
  });

  describe('Compiled artifacts exist', () => {
    it('should have cli.js', () => {
      expect(existsSync('dist/cli.js')).toBe(true);
    });

    it('should have cli-display.js', () => {
      expect(existsSync('dist/cli-display.js')).toBe(true);
    });

    it('should have background-generator.js', () => {
      expect(existsSync('dist/background-generator.js')).toBe(true);
    });

    it('should have executable shebang in cli.js', () => {
      const content = readFileSync('dist/cli.js', 'utf-8');
      expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
    });

    it('should have executable shebang in cli-display.js', () => {
      const content = readFileSync('dist/cli-display.js', 'utf-8');
      expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
    });
  });
});
