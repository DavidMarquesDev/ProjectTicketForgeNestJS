type StructuredLogInput = {
    level: 'info' | 'warn' | 'error';
    action: string;
    context?: Record<string, unknown>;
};

export function toStructuredLog(input: StructuredLogInput): string {
    return JSON.stringify({
        level: input.level,
        action: input.action,
        timestamp: new Date().toISOString(),
        ...input.context,
    });
}
