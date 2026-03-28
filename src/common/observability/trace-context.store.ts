import { AsyncLocalStorage } from 'async_hooks';

type TraceContext = {
    traceId: string;
    requestId: string;
};

const traceStorage = new AsyncLocalStorage<TraceContext>();

export class TraceContextStore {
    static run<T>(context: TraceContext, callback: () => T): T {
        return traceStorage.run(context, callback);
    }

    static getTraceId(): string | undefined {
        return traceStorage.getStore()?.traceId;
    }

    static getRequestId(): string | undefined {
        return traceStorage.getStore()?.requestId;
    }
}
