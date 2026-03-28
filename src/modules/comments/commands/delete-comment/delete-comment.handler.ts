import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRole } from '../../../auth/entities/user.entity';
import { DeleteCommentCommand } from './delete-comment.command';
import { COMMENT_REPOSITORY, type ICommentRepository } from '../../repositories/comment.repository.interface';

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler implements ICommandHandler<DeleteCommentCommand> {
    constructor(
        @Inject(COMMENT_REPOSITORY)
        private readonly commentRepository: ICommentRepository,
    ) {}

    /**
     * Deletes a comment enforcing authorship or admin permission.
     *
     * @param command Comment delete command payload.
     * @returns Deleted comment identifier.
     * @throws NotFoundException When comment is not found in the informed ticket.
     * @throws ForbiddenException When user has no permission to delete the comment.
     */
    async execute(command: DeleteCommentCommand): Promise<{ id: number; success: true }> {
        const comment = await this.commentRepository.findById(command.commentId);
        if (!comment || comment.ticketId !== command.ticketId) {
            throw new NotFoundException('Comentário não encontrado');
        }

        const canDelete = comment.authorId === command.actorId || command.actorRole === UserRole.ADMIN;
        if (!canDelete) {
            throw new ForbiddenException('Usuário não possui permissão para excluir comentário');
        }

        await this.commentRepository.deleteById(comment.id);

        return { id: comment.id, success: true };
    }
}
