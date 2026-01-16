// src/validation.ts
const UUID_REGEX = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const AGENT_ID_REGEX = /^agent-[a-f0-9]{7}$/;
export function validateSessionId(sessionId) {
    return UUID_REGEX.test(sessionId) || AGENT_ID_REGEX.test(sessionId);
}
//# sourceMappingURL=validation.js.map
