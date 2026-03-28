import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { toStructuredLog } from '../../common/logging/structured-log.helper';
import { DomainEventsQueueProducer } from './domain-events-queue.producer';
import { OutboxService } from '../outbox/outbox.service';

@Injectable()
export class OutboxDispatcherService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(OutboxDispatcherService.name);
    private readonly isQueueEnabled = process.env.ASYNC_QUEUE_ENABLED === 'true';
    private readonly pollIntervalMs = Number(process.env.OUTBOX_POLL_INTERVAL_MS ?? 5000);
    private readonly batchSize = Number(process.env.OUTBOX_BATCH_SIZE ?? 50);
    private timer: NodeJS.Timeout | null = null;
    private isRunning = false;

    constructor(
        private readonly outboxService: OutboxService,
        private readonly queueProducer: DomainEventsQueueProducer,
    ) {}

    onModuleInit(): void {
        if (!this.isQueueEnabled) {
            return;
        }

        this.timer = setInterval(() => {
            void this.dispatchPendingEvents();
        }, this.pollIntervalMs);

        void this.dispatchPendingEvents();
    }

    onModuleDestroy(): void {
        if (!this.timer) {
            return;
        }

        clearInterval(this.timer);
        this.timer = null;
    }

    async dispatchPendingEvents(): Promise<void> {
        if (!this.isQueueEnabled || this.isRunning) {
            return;
        }

        this.isRunning = true;
        try {
            const pendingEvents = await this.outboxService.findDispatchable(this.batchSize);
            for (const pendingEvent of pendingEvents) {
                try {
                    await this.outboxService.markQueued(pendingEvent.id);
                    await this.queueProducer.enqueueOutboxEvent(pendingEvent);
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Erro desconhecido ao enfileirar evento';
                    await this.outboxService.markFailed(pendingEvent.id, message);
                }
            }

            if (pendingEvents.length > 0) {
                this.logger.log(
                    toStructuredLog({
                        level: 'info',
                        action: 'outbox_dispatched',
                        context: {
                            count: pendingEvents.length,
                        },
                    }),
                );
            }
        } finally {
            this.isRunning = false;
        }
    }
}
