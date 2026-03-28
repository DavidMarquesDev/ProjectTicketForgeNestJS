import { ConflictException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { OutboxEventStatus } from '../../../outbox/entities/outbox-event-status.enum';
import { OutboxService } from '../../../outbox/outbox.service';
import { DeadLetterPayloadMaskingService } from '../../services/dead-letter-payload-masking.service';
import { GetDeadLetterEventByIdQuery } from './get-dead-letter-event-by-id.query';

type GetDeadLetterEventByIdResult = {
    success: true;
    data: {
        id: string;
        eventId: string;
        eventName: string;
        schemaVersion: number;
        aggregateType: string;
        aggregateId: string;
        status: OutboxEventStatus.DEAD_LETTERED;
        attempts: number;
        availableAt: Date;
        queuedAt: Date | null;
        processedAt: Date | null;
        deadLetteredAt: Date | null;
        lastError: string | null;
        createdAt: Date;
        updatedAt: Date;
        payloadMasked: unknown;
    };
};

@QueryHandler(GetDeadLetterEventByIdQuery)
export class GetDeadLetterEventByIdHandler implements IQueryHandler<GetDeadLetterEventByIdQuery> {
    async execute(query: GetDeadLetterEventByIdQuery): Promise<GetDeadLetterEventByIdResult> {
        const outboxEvent = await this.outboxService.findById(query.outboxEventId);
        if (!outboxEvent) {
            throw new NotFoundException('Evento de outbox não encontrado');
        }

        if (outboxEvent.status !== OutboxEventStatus.DEAD_LETTERED) {
            throw new ConflictException('O evento informado não está em dead letter');
        }

        return {
            success: true,
            data: {
                id: outboxEvent.id,
                eventId: outboxEvent.eventId,
                eventName: outboxEvent.eventName,
                schemaVersion: outboxEvent.schemaVersion,
                aggregateType: outboxEvent.aggregateType,
                aggregateId: outboxEvent.aggregateId,
                status: OutboxEventStatus.DEAD_LETTERED,
                attempts: outboxEvent.attempts,
                availableAt: outboxEvent.availableAt,
                queuedAt: outboxEvent.queuedAt,
                processedAt: outboxEvent.processedAt,
                deadLetteredAt: outboxEvent.deadLetteredAt,
                lastError: outboxEvent.lastError,
                createdAt: outboxEvent.createdAt,
                updatedAt: outboxEvent.updatedAt,
                payloadMasked: this.deadLetterPayloadMaskingService.maskAndTruncatePayload(
                    outboxEvent.payload,
                    query.maskMode,
                ),
            },
        };
    }

    constructor(
        private readonly outboxService: OutboxService,
        private readonly deadLetterPayloadMaskingService: DeadLetterPayloadMaskingService,
    ) {}
}
