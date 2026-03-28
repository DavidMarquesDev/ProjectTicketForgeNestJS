export enum OutboxEventStatus {
    PENDING = 'pending',
    QUEUED = 'queued',
    PROCESSED = 'processed',
    FAILED = 'failed',
}
