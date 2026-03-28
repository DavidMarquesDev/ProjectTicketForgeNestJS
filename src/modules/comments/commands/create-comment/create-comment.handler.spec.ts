import { NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from './create-comment.command';
import { CreateCommentHandler } from './create-comment.handler';

describe('CreateCommentHandler', () => {
    it('deve criar comentário e publicar evento', async () => {
        const commentRepository = {
            createAndSave: jest.fn().mockResolvedValue({
                id: 20,
                ticketId: 1,
                authorId: 1,
                content: 'Comentário',
                createdAt: new Date(),
            }),
        };
        const ticketRepository = {
            findOneDetailed: jest.fn().mockResolvedValue({ id: 1 }),
        };
        const eventBus = {
            publish: jest.fn(),
        } as unknown as EventBus;
        const handler = new CreateCommentHandler(
            commentRepository as never,
            ticketRepository as never,
            eventBus,
        );

        const result = await handler.execute(new CreateCommentCommand(1, 1, 'Comentário'));

        expect(result).toEqual({ id: 20, success: true });
        expect(eventBus.publish).toHaveBeenCalled();
    });

    it('deve falhar quando ticket não existir', async () => {
        const commentRepository = {
            createAndSave: jest.fn(),
        };
        const ticketRepository = {
            findOneDetailed: jest.fn().mockResolvedValue(null),
        };
        const eventBus = {
            publish: jest.fn(),
        } as unknown as EventBus;
        const handler = new CreateCommentHandler(
            commentRepository as never,
            ticketRepository as never,
            eventBus,
        );

        await expect(handler.execute(new CreateCommentCommand(999, 1, 'Comentário'))).rejects.toThrow(
            NotFoundException,
        );
    });
});
