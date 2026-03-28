import { TraceContextStore } from '../observability/trace-context.store';

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
        trace_id: TraceContextStore.getTraceId(),
        request_id: TraceContextStore.getRequestId(),
        ...input.context,
    });
}
