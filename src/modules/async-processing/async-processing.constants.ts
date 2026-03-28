export const DOMAIN_EVENTS_QUEUE = 'domain-events';
export const PROCESS_OUTBOX_EVENT_JOB = 'process-outbox-event';

export type OutboxDispatchJobPayload = {
    outboxEventId: string;
    eventName: string;
    aggregateType: string;
    aggregateId: string;
    payload: string;
};
