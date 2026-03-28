export enum OutboxEventStatus {
    PENDING = 'pending',
    QUEUED = 'queued',
    PROCESSED = 'processed',
    FAILED = 'failed',
    DEAD_LETTERED = 'dead_lettered',
}
