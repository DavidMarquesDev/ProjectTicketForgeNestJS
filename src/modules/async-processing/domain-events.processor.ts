import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { toStructuredLog } from '../../common/logging/structured-log.helper';
import { OutboxService } from '../outbox/outbox.service';
import { DOMAIN_EVENTS_QUEUE, OutboxDispatchJobPayload, PROCESS_OUTBOX_EVENT_JOB } from './async-processing.constants';
import { INotificationDispatcher, NOTIFICATION_DISPATCHER } from './notifications/notification-dispatcher.interface';

@Injectable()
@Processor(DOMAIN_EVENTS_QUEUE)
export class DomainEventsProcessor extends WorkerHost {
    private readonly logger = new Logger(DomainEventsProcessor.name);

    constructor(
        private readonly outboxService: OutboxService,
        @Inject(NOTIFICATION_DISPATCHER)
        private readonly notificationDispatcher: INotificationDispatcher,
    ) {
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
                    event_id: job.data.eventId,
                    event_name: job.data.eventName,
                    schema_version: job.data.schemaVersion,
                    aggregate_type: job.data.aggregateType,
                    aggregate_id: job.data.aggregateId,
                },
            }),
        );

        if (await this.outboxService.hasProcessedEventWithEventId(job.data.eventId, job.data.outboxEventId)) {
            this.logger.log(
                toStructuredLog({
                    level: 'info',
                    action: 'queue_duplicate_ignored',
                    context: {
                        outbox_event_id: job.data.outboxEventId,
                        event_id: job.data.eventId,
                        event_name: job.data.eventName,
                    },
                }),
            );
            await this.outboxService.markProcessed(job.data.outboxEventId);
            return;
        }

        if (this.isNotificationEvent(job.data.eventName)) {
            await this.notificationDispatcher.dispatch({
                eventName: job.data.eventName,
                aggregateId: job.data.aggregateId,
                payload: this.parsePayload(job.data.payload),
            });
            this.logger.log(
                toStructuredLog({
                    level: 'info',
                    action: 'notification_dispatched',
                    context: {
                        outbox_event_id: job.data.outboxEventId,
                        event_id: job.data.eventId,
                        event_name: job.data.eventName,
                        schema_version: job.data.schemaVersion,
                        aggregate_id: job.data.aggregateId,
                    },
                }),
            );
        }

        await this.outboxService.markProcessed(job.data.outboxEventId);
    }

    private isNotificationEvent(eventName: string): boolean {
        return eventName.endsWith('NotificationRequestedEvent');
    }

    private parsePayload(payload: string): Record<string, unknown> {
        try {
            const parsedPayload = JSON.parse(payload) as Record<string, unknown>;
            if (typeof parsedPayload === 'object' && parsedPayload !== null) {
                return parsedPayload;
            }
        } catch (error) {
            this.logger.warn(
                toStructuredLog({
                    level: 'warn',
                    action: 'notification_payload_parse_failed',
                    context: {
                        payload,
                        error_message: error instanceof Error ? error.message : 'Erro desconhecido',
                    },
                }),
            );
        }

        return {};
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
                    event_id: job.data.eventId,
                    event_name: job.data.eventName,
                    error_message: error.message,
                },
            }),
        );
    }
}
