import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { OutboxEventStatus } from '../../outbox/entities/outbox-event-status.enum';
import { OutboxService } from '../../outbox/outbox.service';
import { DomainEventsQueueProducer } from '../domain-events-queue.producer';
import { AsyncProcessingPolicyService } from '../policies/async-processing-policy.service';

type ReprocessDeadLetterEventInput = {
    outboxEventId: string;
    actorId: number;
    actorRole: string;
};

type ReprocessDeadLetterEventResult = {
    success: true;
    data: {
        outboxEventId: string;
        status: OutboxEventStatus.QUEUED;
        reprocessedBy: number;
    };
};

@Injectable()
export class ReprocessDeadLetterEventService {
    constructor(
        private readonly outboxService: OutboxService,
        private readonly queueProducer: DomainEventsQueueProducer,
        private readonly asyncProcessingPolicyService: AsyncProcessingPolicyService,
    ) {}

    async execute(input: ReprocessDeadLetterEventInput): Promise<ReprocessDeadLetterEventResult> {
        this.asyncProcessingPolicyService.assertCanReprocessDeadLetter(input.actorRole);

        const outboxEvent = await this.outboxService.findById(input.outboxEventId);
        if (!outboxEvent) {
            throw new NotFoundException('Evento de outbox não encontrado');
        }

        if (outboxEvent.status !== OutboxEventStatus.DEAD_LETTERED) {
            throw new ConflictException('Apenas eventos em dead letter podem ser reprocessados');
        }

        await this.outboxService.prepareDeadLetterForReprocess(outboxEvent.id);

        await this.queueProducer.enqueueOutboxEvent({
            ...outboxEvent,
            status: OutboxEventStatus.QUEUED,
            attempts: 0,
            availableAt: new Date(),
            queuedAt: new Date(),
            processedAt: null,
            deadLetteredAt: null,
            lastError: null,
            updatedAt: new Date(),
        });

        return {
            success: true,
            data: {
                outboxEventId: outboxEvent.id,
                status: OutboxEventStatus.QUEUED,
                reprocessedBy: input.actorId,
            },
        };
    }
}

