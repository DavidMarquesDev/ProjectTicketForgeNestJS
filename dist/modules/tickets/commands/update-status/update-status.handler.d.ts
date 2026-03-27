import { EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateStatusCommand } from './update-status.command';
import { TicketPolicyService } from '../../policies/ticket-policy.service';
import { TicketStatusTransitionService } from '../../domain/ticket-status-transition.service';
import { type ITicketRepository } from '../../repositories/ticket.repository.interface';
export declare class UpdateStatusHandler implements ICommandHandler<UpdateStatusCommand> {
    private readonly ticketRepository;
    private readonly policyService;
    private readonly statusTransitionService;
    private readonly eventBus;
    constructor(ticketRepository: ITicketRepository, policyService: TicketPolicyService, statusTransitionService: TicketStatusTransitionService, eventBus: EventBus);
    execute(command: UpdateStatusCommand): Promise<{
        id: number;
        success: true;
    }>;
}
