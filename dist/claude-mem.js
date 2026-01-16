// src/claude-mem.ts
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
const CLAUDE_MEM_DB = join(homedir(), '.claude', 'plugins', 'cache', 'claude-mem', 'claude-mem.db');
export async function getClaudeMemContext(sessionId, limit = 10) {
    if (!existsSync(CLAUDE_MEM_DB)) {
        return null;
    }
    let db = null;
    try {
        db = new Database(CLAUDE_MEM_DB, { readonly: true });
        // Look up memory_session_id from content_session_id
        const sessionRow = db
            .prepare(`
      SELECT memory_session_id
      FROM sdk_sessions
      WHERE content_session_id = ?
      LIMIT 1
    `)
            .get(sessionId);
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
            .all(memorySessionId, limit);
        if (observations.length === 0) {
            return null;
        }
        // Format observations as context
        return observations.map((obs) => `[${obs.type}] ${obs.title}: ${obs.subtitle}`).join('\n');
    }
    catch (_error) {
        return null;
    }
    finally {
        db?.close();
    }
}
//# sourceMappingURL=claude-mem.js.map
