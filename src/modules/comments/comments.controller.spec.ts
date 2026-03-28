import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CommentsController } from './comments.controller';

describe('CommentsController', () => {
    it('deve aplicar idempotência no update de comentário', async () => {
        const commandBus = {
            execute: jest.fn().mockResolvedValue({ id: 20, success: true }),
        } as unknown as CommandBus;
        const queryBus = {
            execute: jest.fn(),
        } as unknown as QueryBus;
        const idempotencyService = {
            execute: jest.fn(async (input) => input.action()),
        };
        const controller = new CommentsController(commandBus, queryBus, idempotencyService as never);

        const response = await controller.update(
            10,
            20,
            { content: 'novo conteúdo' },
            { id: 2, email: 'user@email.com', role: 'support' },
            'idem-update-comment-20',
        );

        expect(response).toEqual({ id: 20, success: true });
        expect(idempotencyService.execute).toHaveBeenCalledWith({
            scope: 'comments:update:10:20',
            actorId: 2,
            key: 'idem-update-comment-20',
            action: expect.any(Function),
        });
        expect(commandBus.execute).toHaveBeenCalledTimes(1);
    });

    it('deve aplicar idempotência no delete de comentário', async () => {
        const commandBus = {
            execute: jest.fn().mockResolvedValue({ id: 20, success: true }),
        } as unknown as CommandBus;
        const queryBus = {
            execute: jest.fn(),
        } as unknown as QueryBus;
        const idempotencyService = {
            execute: jest.fn(async (input) => input.action()),
        };
        const controller = new CommentsController(commandBus, queryBus, idempotencyService as never);

        const response = await controller.remove(
            10,
            20,
            { id: 2, email: 'user@email.com', role: 'support' },
            'idem-delete-comment-20',
        );

        expect(response).toEqual({ id: 20, success: true });
        expect(idempotencyService.execute).toHaveBeenCalledWith({
            scope: 'comments:delete:10:20',
            actorId: 2,
            key: 'idem-delete-comment-20',
            action: expect.any(Function),
        });
        expect(commandBus.execute).toHaveBeenCalledTimes(1);
    });
});

