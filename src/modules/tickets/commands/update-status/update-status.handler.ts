import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateStatusCommand } from './update-status.command';
import { TicketPolicyService } from '../../policies/ticket-policy.service';
import { TicketStatusTransitionService } from '../../domain/ticket-status-transition.service';
import { TICKET_REPOSITORY, type ITicketRepository } from '../../repositories/ticket.repository.interface';
import { TicketStatusUpdatedEvent } from '../../events/contracts';

@CommandHandler(UpdateStatusCommand)
export class UpdateStatusHandler implements ICommandHandler<UpdateStatusCommand> {
    constructor(
        @Inject(TICKET_REPOSITORY)
        private readonly ticketRepository: ITicketRepository,
        private readonly policyService: TicketPolicyService,
        private readonly statusTransitionService: TicketStatusTransitionService,
        private readonly eventBus: EventBus,
    ) {}

    /**
     * Updates ticket status after permission and transition validation.
     *
     * @param command Status update command payload.
     * @returns Updated ticket identifier.
     */
    async execute(command: UpdateStatusCommand): Promise<{ id: number; success: true }> {
        const ticket = await this.ticketRepository.findById(command.ticketId);

        if (!ticket) {
            throw new NotFoundException('Ticket não encontrado');
        }

        this.policyService.assertCanUpdateStatus(ticket, command.actorId, command.actorRole);
        this.statusTransitionService.assertValidTransition(ticket.status, command.dto.status);

        ticket.status = command.dto.status;
        await this.ticketRepository.save(ticket);

        this.eventBus.publish(
            new TicketStatusUpdatedEvent(command.ticketId, command.dto.status, command.actorId),
        );

        return { id: ticket.id, success: true };
    }
}
