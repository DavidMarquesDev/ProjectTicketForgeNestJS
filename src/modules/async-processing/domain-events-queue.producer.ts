import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { toStructuredLog } from '../../common/logging/structured-log.helper';
import { OutboxEvent } from '../outbox/entities/outbox-event.entity';
import { DOMAIN_EVENTS_QUEUE, OutboxDispatchJobPayload, PROCESS_OUTBOX_EVENT_JOB } from './async-processing.constants';

@Injectable()
export class DomainEventsQueueProducer {
    private readonly logger = new Logger(DomainEventsQueueProducer.name);

    constructor(
        @InjectQueue(DOMAIN_EVENTS_QUEUE)
        private readonly domainEventsQueue: Queue<OutboxDispatchJobPayload>,
    ) {}

    async enqueueOutboxEvent(event: OutboxEvent): Promise<void> {
        await this.domainEventsQueue.add(
            PROCESS_OUTBOX_EVENT_JOB,
            {
                outboxEventId: event.id,
                eventName: event.eventName,
                aggregateType: event.aggregateType,
                aggregateId: event.aggregateId,
                payload: event.payload,
            },
            {
                jobId: event.id,
                attempts: 5,
                backoff: {
                    type: 'exponential',
                    delay: 15000,
                },
                removeOnComplete: 500,
                removeOnFail: 1000,
            },
        );

        this.logger.log(
            toStructuredLog({
                level: 'info',
                action: 'queue_enqueued',
                context: {
                    queue: DOMAIN_EVENTS_QUEUE,
                    job_name: PROCESS_OUTBOX_EVENT_JOB,
                    outbox_event_id: event.id,
                    event_name: event.eventName,
                },
            }),
        );
    }
}
