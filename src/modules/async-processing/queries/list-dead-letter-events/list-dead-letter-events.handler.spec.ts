import { BadRequestException } from '@nestjs/common';
import { DeadLetterSortBy, DeadLetterSortOrder, OutboxService } from '../../../outbox/outbox.service';
import { ListDeadLetterEventsHandler } from './list-dead-letter-events.handler';
import { ListDeadLetterEventsQuery } from './list-dead-letter-events.query';

describe('ListDeadLetterEventsHandler', () => {
    it('deve listar eventos dead letter com paginação', async () => {
        const outboxService = {
            paginateDeadLettered: jest.fn().mockResolvedValue({
                data: [],
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 1,
            }),
        } as unknown as OutboxService;
        const handler = new ListDeadLetterEventsHandler(outboxService);

        const result = await handler.execute(
            new ListDeadLetterEventsQuery({
                page: 1,
                limit: 20,
                eventName: 'TicketNotificationRequestedEvent',
                aggregateType: 'ticket',
                sortBy: DeadLetterSortBy.DEAD_LETTERED_AT,
                order: DeadLetterSortOrder.DESC,
            }),
        );

        expect(result.success).toBe(true);
        expect(result.meta.totalPages).toBe(1);
        expect(outboxService.paginateDeadLettered).toHaveBeenCalled();
    });

    it('deve lançar bad request quando attemptsMin for maior que attemptsMax', async () => {
        const outboxService = {
            paginateDeadLettered: jest.fn(),
        } as unknown as OutboxService;
        const handler = new ListDeadLetterEventsHandler(outboxService);

        await expect(
            handler.execute(
                new ListDeadLetterEventsQuery({
                    page: 1,
                    limit: 20,
                    attemptsMin: 5,
                    attemptsMax: 2,
                }),
            ),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});

