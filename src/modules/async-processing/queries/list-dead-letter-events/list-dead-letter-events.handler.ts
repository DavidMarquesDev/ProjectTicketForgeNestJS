import { BadRequestException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListDeadLetterEventsQuery } from './list-dead-letter-events.query';
import { DeadLetterPayloadMaskMode } from '../get-dead-letter-event-by-id/get-dead-letter-event-by-id.query';
import { OutboxEventStatus } from '../../../outbox/entities/outbox-event-status.enum';
import { OutboxService } from '../../../outbox/outbox.service';
import { DeadLetterPayloadMaskingService } from '../../services/dead-letter-payload-masking.service';

type ListDeadLetterEventsResult = {
    success: true;
    data: Array<{
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
    }>;
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

@QueryHandler(ListDeadLetterEventsQuery)
export class ListDeadLetterEventsHandler implements IQueryHandler<ListDeadLetterEventsQuery> {
    constructor(
        private readonly outboxService: OutboxService,
        private readonly deadLetterPayloadMaskingService: DeadLetterPayloadMaskingService,
    ) {}

    async execute(query: ListDeadLetterEventsQuery): Promise<ListDeadLetterEventsResult> {
        if (
            query.filters.attemptsMin !== undefined &&
            query.filters.attemptsMax !== undefined &&
            query.filters.attemptsMin > query.filters.attemptsMax
        ) {
            throw new BadRequestException('attemptsMin não pode ser maior que attemptsMax');
        }

        if (query.filters.from && query.filters.to) {
            const from = new Date(query.filters.from);
            const to = new Date(query.filters.to);
            if (from > to) {
                throw new BadRequestException('from não pode ser maior que to');
            }
        }

        const result = await this.outboxService.paginateDeadLettered({
            page: query.filters.page,
            limit: query.filters.limit,
            eventName: query.filters.eventName,
            aggregateType: query.filters.aggregateType,
            from: query.filters.from ? new Date(query.filters.from) : undefined,
            to: query.filters.to ? new Date(query.filters.to) : undefined,
            attemptsMin: query.filters.attemptsMin,
            attemptsMax: query.filters.attemptsMax,
            sortBy: query.filters.sortBy,
            order: query.filters.order,
        });

        return {
            success: true,
            data: result.data.map((event) => {
                return {
                    id: event.id,
                    eventId: event.eventId,
                    eventName: event.eventName,
                    schemaVersion: event.schemaVersion,
                    aggregateType: event.aggregateType,
                    aggregateId: event.aggregateId,
                    status: OutboxEventStatus.DEAD_LETTERED,
                    attempts: event.attempts,
                    availableAt: event.availableAt,
                    queuedAt: event.queuedAt,
                    processedAt: event.processedAt,
                    deadLetteredAt: event.deadLetteredAt,
                    lastError: event.lastError,
                    createdAt: event.createdAt,
                    updatedAt: event.updatedAt,
                    payloadMasked: this.deadLetterPayloadMaskingService.maskAndTruncatePayload(
                        event.payload,
                        query.filters.maskMode ?? DeadLetterPayloadMaskMode.TOTAL,
                    ),
                };
            }),
            meta: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        };
    }
}
