import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { toStructuredLog } from '../../common/logging/structured-log.helper';
import { OutboxService } from '../outbox/outbox.service';
import { DOMAIN_EVENTS_QUEUE, OutboxDispatchJobPayload, PROCESS_OUTBOX_EVENT_JOB } from './async-processing.constants';

@Injectable()
@Processor(DOMAIN_EVENTS_QUEUE)
export class DomainEventsProcessor extends WorkerHost {
    private readonly logger = new Logger(DomainEventsProcessor.name);

    constructor(private readonly outboxService: OutboxService) {
        super();
    }

    async process(job: Job<OutboxDispatchJobPayload>): Promise<void> {
        if (job.name !== PROCESS_OUTBOX_EVENT_JOB) {
            return;
        }

        this.logger.log(
            toStructuredLog({
                level: 'info',
                action: 'queue_processing',
                context: {
                    queue: DOMAIN_EVENTS_QUEUE,
                    job_id: job.id,
                    outbox_event_id: job.data.outboxEventId,
                    event_name: job.data.eventName,
                    aggregate_type: job.data.aggregateType,
                    aggregate_id: job.data.aggregateId,
                },
            }),
        );

        await this.outboxService.markProcessed(job.data.outboxEventId);
    }

    @OnWorkerEvent('failed')
    async onFailed(job: Job<OutboxDispatchJobPayload> | undefined, error: Error): Promise<void> {
        if (!job) {
            return;
        }

        await this.outboxService.markFailed(job.data.outboxEventId, error.message);
        this.logger.error(
            toStructuredLog({
                level: 'error',
                action: 'queue_failed',
                context: {
                    queue: DOMAIN_EVENTS_QUEUE,
                    job_id: job.id,
                    outbox_event_id: job.data.outboxEventId,
                    event_name: job.data.eventName,
                    error_message: error.message,
                },
            }),
        );
    }
}
