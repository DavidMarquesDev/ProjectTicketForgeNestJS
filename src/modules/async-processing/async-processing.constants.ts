export const DOMAIN_EVENTS_QUEUE = 'domain-events';
export const PROCESS_OUTBOX_EVENT_JOB = 'process-outbox-event';

export type OutboxDispatchJobPayload = {
    outboxEventId: string;
    eventId: string;
    eventName: string;
    schemaVersion: number;
    aggregateType: string;
    aggregateId: string;
    payload: string;
};
