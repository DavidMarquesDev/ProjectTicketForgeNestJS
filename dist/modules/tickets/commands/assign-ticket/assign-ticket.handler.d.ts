import { ICommandHandler } from '@nestjs/cqrs';
import { AssignTicketCommand } from './assign-ticket.command';
import { TicketPolicyService } from '../../policies/ticket-policy.service';
import { type ITicketRepository } from '../../repositories/ticket.repository.interface';
export declare class AssignTicketHandler implements ICommandHandler<AssignTicketCommand> {
    private readonly ticketRepository;
    private readonly policyService;
    constructor(ticketRepository: ITicketRepository, policyService: TicketPolicyService);
    execute(command: AssignTicketCommand): Promise<{
        id: number;
        success: true;
    }>;
}
