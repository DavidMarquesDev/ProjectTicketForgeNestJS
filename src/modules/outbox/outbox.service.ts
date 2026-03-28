import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThanOrEqual, Repository } from 'typeorm';
import { OutboxEvent } from './entities/outbox-event.entity';
import { OutboxEventStatus } from './entities/outbox-event-status.enum';

type CreateOutboxEventInput = {
    eventName: string;
    aggregateType: string;
    aggregateId: string;
    payload: Record<string, unknown>;
};

@Injectable()
export class OutboxService {
    constructor(
        @InjectRepository(OutboxEvent)
        private readonly outboxRepository: Repository<OutboxEvent>,
    ) {}

    async createPendingEvent(input: CreateOutboxEventInput, manager?: EntityManager): Promise<OutboxEvent> {
        const repository = this.resolveRepository(manager);
        const event = repository.create({
            eventName: input.eventName,
            aggregateType: input.aggregateType,
            aggregateId: input.aggregateId,
            payload: JSON.stringify(input.payload),
            status: OutboxEventStatus.PENDING,
            attempts: 0,
            availableAt: new Date(),
            queuedAt: null,
            processedAt: null,
            lastError: null,
        });

        return repository.save(event);
    }

    async findDispatchable(limit: number): Promise<OutboxEvent[]> {
        return this.outboxRepository.find({
            where: [
                {
                    status: OutboxEventStatus.PENDING,
                    availableAt: LessThanOrEqual(new Date()),
                },
                {
                    status: OutboxEventStatus.FAILED,
                    availableAt: LessThanOrEqual(new Date()),
                },
            ],
            order: {
                createdAt: 'ASC',
            },
            take: limit,
        });
    }

    async markQueued(eventId: string): Promise<void> {
        await this.outboxRepository.update(
            { id: eventId },
            {
                status: OutboxEventStatus.QUEUED,
                queuedAt: new Date(),
                updatedAt: new Date(),
            },
        );
    }

    async markProcessed(eventId: string): Promise<void> {
        await this.outboxRepository.update(
            { id: eventId },
            {
                status: OutboxEventStatus.PROCESSED,
                processedAt: new Date(),
                updatedAt: new Date(),
            },
        );
    }

    async markFailed(eventId: string, errorMessage: string): Promise<void> {
        const currentEvent = await this.outboxRepository.findOne({ where: { id: eventId } });
        if (!currentEvent) {
            return;
        }

        const attempts = currentEvent.attempts + 1;
        const retryDelaySeconds = Math.min(attempts * 15, 300);
        const availableAt = new Date(Date.now() + retryDelaySeconds * 1000);

        await this.outboxRepository.update(
            { id: eventId },
            {
                status: OutboxEventStatus.FAILED,
                attempts,
                availableAt,
                lastError: errorMessage,
                updatedAt: new Date(),
            },
        );
    }

    private resolveRepository(manager?: EntityManager): Repository<OutboxEvent> {
        if (manager) {
            return manager.getRepository(OutboxEvent);
        }

        return this.outboxRepository;
    }
}
