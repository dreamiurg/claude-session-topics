export declare function getLockPath(sessionId: string, dir?: string): string;
/**
 * Acquire a lock for the given session
 * @returns Release function to unlock, or null if lock could not be acquired
 */
export declare function acquireLock(sessionId: string, dir?: string, maxAge?: number): Promise<(() => Promise<void>) | null>;
/**
 * Release a lock using the release function
 */
export declare function releaseLock(release: (() => Promise<void>) | null): Promise<void>;
/**
 * Check if a lock is currently held
 */
export declare function isLocked(sessionId: string, dir?: string): Promise<boolean>;
/**
 * Force-release a lock by session ID (for background processes)
 * This directly unlocks without needing the release function
 */
export declare function forceReleaseLock(sessionId: string, dir?: string): Promise<void>;
//# sourceMappingURL=lock.d.ts.map
