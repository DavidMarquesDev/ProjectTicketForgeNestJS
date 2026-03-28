import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { TICKET_REPOSITORY, type ITicketRepository } from '../../../tickets/repositories/ticket.repository.interface';
import { CreateCommentCommand } from './create-comment.command';
import { COMMENT_REPOSITORY, type ICommentRepository } from '../../repositories/comment.repository.interface';
import { CommentCreatedEvent } from '../../events/comment-created.event';

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler implements ICommandHandler<CreateCommentCommand> {
    constructor(
        @Inject(COMMENT_REPOSITORY)
        private readonly commentRepository: ICommentRepository,
        @Inject(TICKET_REPOSITORY)
        private readonly ticketRepository: ITicketRepository,
        private readonly eventBus: EventBus,
    ) {}

    /**
     * Creates a comment for an existing ticket and publishes an event.
     *
     * @param command Comment creation command payload.
     * @returns Created comment identifier.
     * @throws NotFoundException When ticket does not exist.
     */
    async execute(command: CreateCommentCommand): Promise<{ id: number; success: true }> {
        const ticket = await this.ticketRepository.findOneDetailed(command.ticketId);
        if (!ticket) {
            throw new NotFoundException('Ticket não encontrado');
        }

        const comment = await this.commentRepository.createAndSave({
            ticketId: command.ticketId,
            authorId: command.authorId,
            content: command.content,
        });

        this.eventBus.publish(new CommentCreatedEvent(comment.id, command.ticketId, command.authorId));

        return { id: comment.id, success: true };
    }
}
