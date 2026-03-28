import { BadRequestException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListDeadLetterEventsQuery } from './list-dead-letter-events.query';
import { OutboxEvent } from '../../../outbox/entities/outbox-event.entity';
import { OutboxService } from '../../../outbox/outbox.service';

type ListDeadLetterEventsResult = {
    success: true;
    data: OutboxEvent[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

@QueryHandler(ListDeadLetterEventsQuery)
export class ListDeadLetterEventsHandler implements IQueryHandler<ListDeadLetterEventsQuery> {
    constructor(private readonly outboxService: OutboxService) {}

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
            data: result.data,
            meta: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        };
    }
}

