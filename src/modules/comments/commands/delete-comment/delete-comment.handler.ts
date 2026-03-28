import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteCommentCommand } from './delete-comment.command';
import { CommentDeletedEvent } from '../../events/contracts';
import { CommentPolicyService } from '../../policies/comment-policy.service';
import { COMMENT_REPOSITORY, type ICommentRepository } from '../../repositories/comment.repository.interface';

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler implements ICommandHandler<DeleteCommentCommand> {
    constructor(
        @Inject(COMMENT_REPOSITORY)
        private readonly commentRepository: ICommentRepository,
        private readonly policyService: CommentPolicyService,
        private readonly eventBus: EventBus,
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

        this.policyService.assertCanDelete(comment, command.actorId, command.actorRole);

        await this.commentRepository.deleteById(comment.id);
        this.eventBus.publish(
            new CommentDeletedEvent(
                comment.id,
                command.ticketId,
                command.actorId,
            ),
        );

        return { id: comment.id, success: true };
    }
}
