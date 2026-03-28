import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AsyncProcessingController } from './async-processing.controller';
import { ReprocessDeadLetterEventCommand } from './commands/reprocess-dead-letter-event/reprocess-dead-letter-event.command';
import { GetDeadLetterEventByIdQuery } from './queries/get-dead-letter-event-by-id/get-dead-letter-event-by-id.query';
import { ListDeadLetterEventsQuery } from './queries/list-dead-letter-events/list-dead-letter-events.query';

describe('AsyncProcessingController', () => {
    it('deve reenfileirar evento da dead letter via command bus', async () => {
        const commandBus = {
            execute: jest.fn().mockResolvedValue({
                success: true,
                data: {
                    outboxEventId: 'evt-1',
                    status: 'queued',
                    reprocessedBy: 1,
                },
            }),
        } as unknown as CommandBus;
        const queryBus = {
            execute: jest.fn(),
        } as unknown as QueryBus;
        const controller = new AsyncProcessingController(commandBus, queryBus);

        const result = await controller.reprocessDeadLetter('evt-1', {
            id: 1,
            email: 'admin@ticketforge.dev',
            role: 'admin',
        });

        expect(result).toEqual({
            success: true,
            data: {
                outboxEventId: 'evt-1',
                status: 'queued',
                reprocessedBy: 1,
            },
        });
        expect(commandBus.execute).toHaveBeenCalledWith(
            expect.any(ReprocessDeadLetterEventCommand),
        );
    });

    it('deve listar eventos da dead letter via query bus', async () => {
        const commandBus = {
            execute: jest.fn(),
        } as unknown as CommandBus;
        const queryBus = {
            execute: jest.fn().mockResolvedValue({
                success: true,
                data: [],
                meta: {
                    page: 1,
                    limit: 20,
                    total: 0,
                    totalPages: 1,
                },
            }),
        } as unknown as QueryBus;
        const controller = new AsyncProcessingController(commandBus, queryBus);

        const result = await controller.listDeadLetters({
            page: 1,
            limit: 20,
            sortBy: undefined,
            order: undefined,
        });

        expect(result).toEqual({
            success: true,
            data: [],
            meta: {
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 1,
            },
        });
        expect(queryBus.execute).toHaveBeenCalledWith(expect.any(ListDeadLetterEventsQuery));
    });

    it('deve buscar detalhe de evento da dead letter por id via query bus', async () => {
        const commandBus = {
            execute: jest.fn(),
        } as unknown as CommandBus;
        const queryBus = {
            execute: jest.fn().mockResolvedValue({
                success: true,
                data: {
                    id: 'evt-1',
                },
            }),
        } as unknown as QueryBus;
        const controller = new AsyncProcessingController(commandBus, queryBus);

        const result = await controller.getDeadLetterById('evt-1');

        expect(result).toEqual({
            success: true,
            data: {
                id: 'evt-1',
            },
        });
        expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetDeadLetterEventByIdQuery));
    });
});
