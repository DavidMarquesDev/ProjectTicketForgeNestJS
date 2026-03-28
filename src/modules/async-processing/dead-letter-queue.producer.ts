import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { toStructuredLog } from '../../common/logging/structured-log.helper';
import {
    DOMAIN_EVENTS_DLQ_QUEUE,
    OutboxDeadLetterJobPayload,
    PROCESS_OUTBOX_EVENT_DLQ_JOB,
} from './async-processing.constants';

type DeadLetterInput = {
    outboxEventId: string;
    eventId: string;
    eventName: string;
    schemaVersion: number;
    aggregateType: string;
    aggregateId: string;
    traceId: string | null;
    payload: string;
    attempts: number;
    errorMessage: string;
};

@Injectable()
export class DeadLetterQueueProducer {
    private readonly logger = new Logger(DeadLetterQueueProducer.name);

    constructor(
        @InjectQueue(DOMAIN_EVENTS_DLQ_QUEUE)
        private readonly deadLetterQueue: Queue<OutboxDeadLetterJobPayload>,
    ) {}

    async enqueue(input: DeadLetterInput): Promise<void> {
        await this.deadLetterQueue.add(
            PROCESS_OUTBOX_EVENT_DLQ_JOB,
            {
                ...input,
                failedAt: new Date().toISOString(),
            },
            {
                jobId: input.outboxEventId,
                removeOnComplete: 2000,
                removeOnFail: 2000,
            },
        );

        this.logger.warn(
            toStructuredLog({
                level: 'warn',
                action: 'queue_dead_lettered',
                context: {
                    outbox_event_id: input.outboxEventId,
                    event_id: input.eventId,
                    event_name: input.eventName,
                    attempts: input.attempts,
                    error_message: input.errorMessage,
                },
            }),
        );
    }
}

