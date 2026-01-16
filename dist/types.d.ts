export interface SessionState {
    count: number;
    topic: string;
    error: string;
    generated_at: number;
}
export interface HookInput {
    session_id: string;
    cwd: string;
    transcript_path?: string;
    stop_hook_active: boolean;
    hook_event_name: string;
    permission_mode: string;
}
export interface ClaudeMemObservation {
    type: string;
    title: string;
    subtitle: string;
}
export interface TranscriptMessage {
    type: 'user' | 'assistant';
    message: {
        role: string;
        content: string | MessageContent[];
    };
    timestamp: string;
}
export interface MessageContent {
    type: 'text' | 'tool_use' | 'tool_result' | 'thinking';
    text?: string;
    thinking?: string;
}
export interface TopicGenerationConfig {
    contextLines: number;
    claudeTimeout: number;
    regenInterval: number;
    lockTimeout: number;
    claudeMemLimit: number;
}
export declare const DEFAULT_CONFIG: TopicGenerationConfig;
//# sourceMappingURL=types.d.ts.map
