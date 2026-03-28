import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuditTrailService } from '../../../audit/services/audit-trail.service';
import { UpdateCommentCommand } from './update-comment.command';
import { CommentPolicyService } from '../../policies/comment-policy.service';
import { COMMENT_REPOSITORY, type ICommentRepository } from '../../repositories/comment.repository.interface';

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler implements ICommandHandler<UpdateCommentCommand> {
    constructor(
        @Inject(COMMENT_REPOSITORY)
        private readonly commentRepository: ICommentRepository,
        private readonly policyService: CommentPolicyService,
        private readonly auditTrailService: AuditTrailService,
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

        this.policyService.assertCanUpdate(comment, command.actorId, command.actorRole);

        comment.content = command.dto.content;
        const savedComment = await this.commentRepository.save(comment);
        await this.auditTrailService.record({
            action: 'comment_updated',
            aggregateType: 'comment',
            aggregateId: savedComment.id.toString(),
            actorId: command.actorId,
            metadata: {
                ticketId: command.ticketId,
            },
        });

        return { id: savedComment.id, success: true };
    }
}
