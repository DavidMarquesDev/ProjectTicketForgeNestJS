import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DOMAIN_EVENTS_DLQ_QUEUE, DOMAIN_EVENTS_QUEUE } from './async-processing.constants';
import { AsyncProcessingController } from './async-processing.controller';
import { ReprocessDeadLetterEventHandler } from './commands/reprocess-dead-letter-event/reprocess-dead-letter-event.handler';
import { DeadLetterQueueProducer } from './dead-letter-queue.producer';
import { DomainEventsProcessor } from './domain-events.processor';
import { DomainEventsQueueProducer } from './domain-events-queue.producer';
import { NOTIFICATION_DISPATCHER } from './notifications/notification-dispatcher.interface';
import { WebhookNotificationDispatcher } from './notifications/webhook-notification.dispatcher';
import { OutboxDispatcherService } from './outbox-dispatcher.service';
import { AsyncProcessingPolicyService } from './policies/async-processing-policy.service';
import { GetDeadLetterEventByIdHandler } from './queries/get-dead-letter-event-by-id/get-dead-letter-event-by-id.handler';
import { ListDeadLetterEventsHandler } from './queries/list-dead-letter-events/list-dead-letter-events.handler';
import { DeadLetterPayloadMaskingService } from './services/dead-letter-payload-masking.service';
import { ReprocessDeadLetterEventService } from './services/reprocess-dead-letter-event.service';
import { OutboxModule } from '../outbox/outbox.module';

@Module({
    imports: [
        CqrsModule,
        OutboxModule,
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST ?? '127.0.0.1',
                port: Number(process.env.REDIS_PORT ?? 6379),
                password: process.env.REDIS_PASSWORD || undefined,
            },
        }),
        BullModule.registerQueue({
            name: DOMAIN_EVENTS_QUEUE,
        }),
        BullModule.registerQueue({
            name: DOMAIN_EVENTS_DLQ_QUEUE,
        }),
    ],
    controllers: [AsyncProcessingController],
    providers: [
        DomainEventsQueueProducer,
        DeadLetterQueueProducer,
        DomainEventsProcessor,
        OutboxDispatcherService,
        AsyncProcessingPolicyService,
        DeadLetterPayloadMaskingService,
        ReprocessDeadLetterEventService,
        ReprocessDeadLetterEventHandler,
        ListDeadLetterEventsHandler,
        GetDeadLetterEventByIdHandler,
        WebhookNotificationDispatcher,
        {
            provide: NOTIFICATION_DISPATCHER,
            useExisting: WebhookNotificationDispatcher,
        },
    ],
    exports: [DomainEventsQueueProducer, DeadLetterQueueProducer],
})
export class AsyncProcessingModule {}
