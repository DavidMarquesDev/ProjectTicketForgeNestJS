import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TicketsController } from './tickets.controller';

describe('TicketsController', () => {
    it('deve aplicar idempotência no assign', async () => {
        const commandBus = {
            execute: jest.fn().mockResolvedValue({ id: 10, success: true }),
        } as unknown as CommandBus;
        const queryBus = {
            execute: jest.fn(),
        } as unknown as QueryBus;
        const idempotencyService = {
            execute: jest.fn(async (input) => input.action()),
        };
        const controller = new TicketsController(commandBus, queryBus, idempotencyService as never);

        const response = await controller.assign(
            10,
            { userId: 3 },
            { id: 2, email: 'user@email.com', role: 'support' },
            'idem-assign-10',
        );

        expect(response).toEqual({ id: 10, success: true });
        expect(idempotencyService.execute).toHaveBeenCalledWith({
            scope: 'tickets:assign:10',
            actorId: 2,
            key: 'idem-assign-10',
            action: expect.any(Function),
        });
        expect(commandBus.execute).toHaveBeenCalledTimes(1);
    });
});

