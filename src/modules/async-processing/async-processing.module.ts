import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { DOMAIN_EVENTS_QUEUE } from './async-processing.constants';
import { DomainEventsProcessor } from './domain-events.processor';
import { DomainEventsQueueProducer } from './domain-events-queue.producer';
import { OutboxDispatcherService } from './outbox-dispatcher.service';
import { OutboxModule } from '../outbox/outbox.module';

@Module({
    imports: [
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
    ],
    providers: [DomainEventsQueueProducer, DomainEventsProcessor, OutboxDispatcherService],
    exports: [DomainEventsQueueProducer],
})
export class AsyncProcessingModule {}
