import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRole } from '../../../auth/entities/user.entity';
import { UpdateCommentCommand } from './update-comment.command';
import { COMMENT_REPOSITORY, type ICommentRepository } from '../../repositories/comment.repository.interface';

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler implements ICommandHandler<UpdateCommentCommand> {
    constructor(
        @Inject(COMMENT_REPOSITORY)
        private readonly commentRepository: ICommentRepository,
    ) {}

    /**
     * Updates comment content enforcing authorship or admin permission.
     *
     * @param command Comment update command payload.
     * @returns Updated comment identifier.
     * @throws NotFoundException When comment is not found in the informed ticket.
     * @throws ForbiddenException When user has no permission to update the comment.
     */
    async execute(command: UpdateCommentCommand): Promise<{ id: number; success: true }> {
        const comment = await this.commentRepository.findById(command.commentId);
        if (!comment || comment.ticketId !== command.ticketId) {
            throw new NotFoundException('Comentário não encontrado');
        }

        const canUpdate = comment.authorId === command.actorId || command.actorRole === UserRole.ADMIN;
        if (!canUpdate) {
            throw new ForbiddenException('Usuário não possui permissão para editar comentário');
        }

        comment.content = command.dto.content;
        const savedComment = await this.commentRepository.save(comment);

        return { id: savedComment.id, success: true };
    }
}
