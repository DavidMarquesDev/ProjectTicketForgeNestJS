import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignTicketCommand } from './assign-ticket.command';
import { TicketPolicyService } from '../../policies/ticket-policy.service';
import { TICKET_REPOSITORY, type ITicketRepository } from '../../repositories/ticket.repository.interface';

@CommandHandler(AssignTicketCommand)
export class AssignTicketHandler implements ICommandHandler<AssignTicketCommand> {
    constructor(
        @Inject(TICKET_REPOSITORY)
        private readonly ticketRepository: ITicketRepository,
        private readonly policyService: TicketPolicyService,
    ) {}

    async execute(command: AssignTicketCommand): Promise<{ id: number; success: true }> {
        this.policyService.assertCanAssign(command.actorRole);

        await this.ticketRepository.findByIdOrFail(command.ticketId);
        await this.ticketRepository.assign(command.ticketId, command.assigneeId);

        return { id: command.ticketId, success: true };
    }
}
