import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { UserRole } from '../../../auth/entities/user.entity';
import { UpdateCommentCommand } from './update-comment.command';
import { UpdateCommentHandler } from './update-comment.handler';

describe('UpdateCommentHandler', () => {
    it('deve atualizar comentário quando autor editar', async () => {
        const repository = {
            findById: jest.fn().mockResolvedValue({
                id: 1,
                ticketId: 10,
                authorId: 5,
                content: 'Conteúdo antigo',
            }),
            save: jest.fn().mockImplementation(async (comment) => comment),
        };
        const policyService = {
            assertCanUpdate: jest.fn(),
        };
        const eventBus = {
            publish: jest.fn(),
        } as unknown as EventBus;
        const handler = new UpdateCommentHandler(
            repository as never,
            policyService as never,
            eventBus,
        );

        const result = await handler.execute(
            new UpdateCommentCommand(
                10,
                1,
                5,
                UserRole.USER,
                { content: 'Conteúdo atualizado' },
            ),
        );

        expect(result).toEqual({ id: 1, success: true });
        expect(repository.save).toHaveBeenCalledWith({
            id: 1,
            ticketId: 10,
            authorId: 5,
            content: 'Conteúdo atualizado',
        });
        expect(policyService.assertCanUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1, ticketId: 10, authorId: 5 }),
            5,
            UserRole.USER,
        );
        expect(eventBus.publish).toHaveBeenCalledTimes(1);
    });

    it('deve lançar not found quando comentário não existir no ticket', async () => {
        const repository = {
            findById: jest.fn().mockResolvedValue({
                id: 1,
                ticketId: 99,
                authorId: 5,
                content: 'Conteúdo antigo',
            }),
            save: jest.fn(),
        };
        const policyService = {
            assertCanUpdate: jest.fn(),
        };
        const eventBus = {
            publish: jest.fn(),
        } as unknown as EventBus;
        const handler = new UpdateCommentHandler(
            repository as never,
            policyService as never,
            eventBus,
        );

        await expect(
            handler.execute(
                new UpdateCommentCommand(
                    10,
                    1,
                    5,
                    UserRole.USER,
                    { content: 'Conteúdo atualizado' },
                ),
            ),
        ).rejects.toThrow(NotFoundException);
        expect(repository.save).not.toHaveBeenCalled();
        expect(policyService.assertCanUpdate).not.toHaveBeenCalled();
    });

    it('deve lançar forbidden quando usuário sem permissão tentar editar', async () => {
        const repository = {
            findById: jest.fn().mockResolvedValue({
                id: 1,
                ticketId: 10,
                authorId: 5,
                content: 'Conteúdo antigo',
            }),
            save: jest.fn(),
        };
        const policyService = {
            assertCanUpdate: jest.fn(() => {
                throw new ForbiddenException('Usuário não possui permissão para editar comentário');
            }),
        };
        const eventBus = {
            publish: jest.fn(),
        } as unknown as EventBus;
        const handler = new UpdateCommentHandler(
            repository as never,
            policyService as never,
            eventBus,
        );

        await expect(
            handler.execute(
                new UpdateCommentCommand(
                    10,
                    1,
                    8,
                    UserRole.SUPPORT,
                    { content: 'Conteúdo atualizado' },
                ),
            ),
        ).rejects.toThrow(ForbiddenException);
        expect(repository.save).not.toHaveBeenCalled();
        expect(policyService.assertCanUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1, ticketId: 10, authorId: 5 }),
            8,
            UserRole.SUPPORT,
        );
    });
});
