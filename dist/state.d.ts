import type { SessionState } from './types.js';
export declare function getStatePath(sessionId: string, dir?: string): string;
export declare function readState(sessionId: string, dir?: string): SessionState | null;
export declare function writeState(sessionId: string, state: SessionState, dir?: string): void;
//# sourceMappingURL=state.d.ts.map
