// src/state.ts
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const STATE_PREFIX = 'claude-topic-';
export function getStatePath(sessionId, dir) {
    const baseDir = dir || process.env.TMPDIR || tmpdir();
    return join(baseDir, `${STATE_PREFIX}${sessionId}.json`);
}
export function readState(sessionId, dir) {
    const path = getStatePath(sessionId, dir);
    if (!existsSync(path)) {
        return null;
    }
    try {
        const content = readFileSync(path, 'utf-8');
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
export function writeState(sessionId, state, dir) {
    const path = getStatePath(sessionId, dir);
    writeFileSync(path, JSON.stringify(state, null, 2));
}
//# sourceMappingURL=state.js.map
