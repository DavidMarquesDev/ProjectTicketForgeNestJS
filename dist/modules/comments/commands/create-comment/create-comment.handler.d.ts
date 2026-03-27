import { EventBus, ICommandHandler } from '@nestjs/cqrs';
import { type ITicketRepository } from '../../../tickets/repositories/ticket.repository.interface';
import { CreateCommentCommand } from './create-comment.command';
import { type ICommentRepository } from '../../repositories/comment.repository.interface';
export declare class CreateCommentHandler implements ICommandHandler<CreateCommentCommand> {
    private readonly commentRepository;
    private readonly ticketRepository;
    private readonly eventBus;
    constructor(commentRepository: ICommentRepository, ticketRepository: ITicketRepository, eventBus: EventBus);
    execute(command: CreateCommentCommand): Promise<{
        id: number;
        success: true;
    }>;
}
