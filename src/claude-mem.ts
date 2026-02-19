// src/claude-mem.ts

import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { ClaudeMemObservation } from './types.js';

const CLAUDE_MEM_DB = join(homedir(), '.claude', 'plugins', 'cache', 'claude-mem', 'claude-mem.db');

export async function getClaudeMemContext(sessionId: string, limit = 10): Promise<string | null> {
  if (!existsSync(CLAUDE_MEM_DB)) {
    return null;
  }

  let db: import('better-sqlite3').Database | null = null;

  try {
    const Database = (await import('better-sqlite3')).default;
    db = new Database(CLAUDE_MEM_DB, { readonly: true });

    // Look up memory_session_id from content_session_id
    const sessionRow = db
      .prepare(`
      SELECT memory_session_id
      FROM sdk_sessions
      WHERE content_session_id = ?
      LIMIT 1
    `)
      .get(sessionId) as { memory_session_id: string } | undefined;

    if (!sessionRow) {
      return null;
    }

    const memorySessionId = sessionRow.memory_session_id;

    // Query observations
    const observations = db
      .prepare(`
      SELECT type, title, subtitle
      FROM observations
      WHERE memory_session_id = ?
      ORDER BY created_at_epoch DESC
      LIMIT ?
    `)
      .all(memorySessionId, limit) as ClaudeMemObservation[];

    if (observations.length === 0) {
      return null;
    }

    // Format observations as context
    return observations.map((obs) => `[${obs.type}] ${obs.title}: ${obs.subtitle}`).join('\n');
  } catch (_error) {
    return null;
  } finally {
    db?.close();
  }
}
