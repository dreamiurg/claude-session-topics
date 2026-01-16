export declare function buildPrompt(source: 'claude-mem' | 'transcript', context: string, previousTopic?: string): string;
export declare function generateTopic(context: string, source: 'claude-mem' | 'transcript', previousTopic?: string, timeoutMs?: number): Promise<string | null>;
//# sourceMappingURL=topic-generator.d.ts.map
