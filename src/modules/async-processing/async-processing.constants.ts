export const DOMAIN_EVENTS_QUEUE = 'domain-events';
export const DOMAIN_EVENTS_DLQ_QUEUE = 'domain-events-dlq';
export const PROCESS_OUTBOX_EVENT_JOB = 'process-outbox-event';
export const PROCESS_OUTBOX_EVENT_DLQ_JOB = 'process-outbox-event-dlq';

export type OutboxDispatchJobPayload = {
    outboxEventId: string;
    eventId: string;
    eventName: string;
    schemaVersion: number;
    aggregateType: string;
    aggregateId: string;
    payload: string;
};

export type OutboxDeadLetterJobPayload = {
    outboxEventId: string;
    eventId: string;
    eventName: string;
    schemaVersion: number;
    aggregateType: string;
    aggregateId: string;
    payload: string;
    attempts: number;
    errorMessage: string;
    failedAt: string;
};
