import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateStatusCommand } from './update-status.command';
import { OutboxService } from '../../../outbox/outbox.service';
import { TicketPolicyService } from '../../policies/ticket-policy.service';
import { TicketStatusTransitionService } from '../../domain/ticket-status-transition.service';
import { TICKET_REPOSITORY, type ITicketRepository } from '../../repositories/ticket.repository.interface';
import { TicketStatusUpdatedEvent } from '../../events/ticket-status-updated.event';

@CommandHandler(UpdateStatusCommand)
export class UpdateStatusHandler implements ICommandHandler<UpdateStatusCommand> {
    constructor(
        @Inject(TICKET_REPOSITORY)
        private readonly ticketRepository: ITicketRepository,
        private readonly policyService: TicketPolicyService,
        private readonly statusTransitionService: TicketStatusTransitionService,
        private readonly eventBus: EventBus,
        private readonly outboxService: OutboxService,
    ) {}

    /**
     * Updates ticket status after permission and transition validation.
     *
     * @param command Status update command payload.
     * @returns Updated ticket identifier.
     */
    async execute(command: UpdateStatusCommand): Promise<{ id: number; success: true }> {
        const ticket = await this.ticketRepository.findByIdOrFail(command.ticketId);

        this.policyService.assertCanUpdateStatus(ticket, command.actorId, command.actorRole);
        this.statusTransitionService.assertValidTransition(ticket.status, command.status);

        ticket.status = command.status;
        await this.ticketRepository.save(ticket);

        this.eventBus.publish(
            new TicketStatusUpdatedEvent(command.ticketId, command.status, command.actorId),
        );
        await this.outboxService.createPendingEvent({
            eventName: 'TicketStatusUpdatedEvent',
            aggregateType: 'ticket',
            aggregateId: command.ticketId.toString(),
            payload: {
                ticketId: command.ticketId,
                status: command.status,
                updatedBy: command.actorId,
            },
        });

        return { id: ticket.id, success: true };
    }
}
