import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '../../../auth/entities/user.entity';
import { DeleteCommentCommand } from './delete-comment.command';
import { DeleteCommentHandler } from './delete-comment.handler';

describe('DeleteCommentHandler', () => {
    it('deve excluir comentário quando autor solicitar', async () => {
        const repository = {
            findById: jest.fn().mockResolvedValue({
                id: 12,
                ticketId: 7,
                authorId: 5,
            }),
            deleteById: jest.fn(),
        };
        const policyService = {
            assertCanDelete: jest.fn(),
        };
        const handler = new DeleteCommentHandler(repository as never, policyService as never);

        const result = await handler.execute(new DeleteCommentCommand(7, 12, 5, UserRole.USER));

        expect(result).toEqual({ id: 12, success: true });
        expect(repository.deleteById).toHaveBeenCalledWith(12);
        expect(policyService.assertCanDelete).toHaveBeenCalledWith(
            expect.objectContaining({ id: 12, ticketId: 7, authorId: 5 }),
            5,
            UserRole.USER,
        );
    });

    it('deve lançar not found quando comentário não estiver no ticket', async () => {
        const repository = {
            findById: jest.fn().mockResolvedValue({
                id: 12,
                ticketId: 99,
                authorId: 5,
            }),
            deleteById: jest.fn(),
        };
        const policyService = {
            assertCanDelete: jest.fn(),
        };
        const handler = new DeleteCommentHandler(repository as never, policyService as never);

        await expect(handler.execute(new DeleteCommentCommand(7, 12, 5, UserRole.USER))).rejects.toThrow(
            NotFoundException,
        );
        expect(repository.deleteById).not.toHaveBeenCalled();
        expect(policyService.assertCanDelete).not.toHaveBeenCalled();
    });

    it('deve lançar forbidden para usuário sem permissão', async () => {
        const repository = {
            findById: jest.fn().mockResolvedValue({
                id: 12,
                ticketId: 7,
                authorId: 5,
            }),
            deleteById: jest.fn(),
        };
        const policyService = {
            assertCanDelete: jest.fn(() => {
                throw new ForbiddenException('Usuário não possui permissão para excluir comentário');
            }),
        };
        const handler = new DeleteCommentHandler(repository as never, policyService as never);

        await expect(
            handler.execute(new DeleteCommentCommand(7, 12, 8, UserRole.SUPPORT)),
        ).rejects.toThrow(ForbiddenException);
        expect(repository.deleteById).not.toHaveBeenCalled();
        expect(policyService.assertCanDelete).toHaveBeenCalledWith(
            expect.objectContaining({ id: 12, ticketId: 7, authorId: 5 }),
            8,
            UserRole.SUPPORT,
        );
    });
});
