import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuditTrailService } from '../../../audit/services/audit-trail.service';
import { AssignTicketCommand } from './assign-ticket.command';
import { TicketPolicyService } from '../../policies/ticket-policy.service';
import { TICKET_REPOSITORY, type ITicketRepository } from '../../repositories/ticket.repository.interface';

@CommandHandler(AssignTicketCommand)
export class AssignTicketHandler implements ICommandHandler<AssignTicketCommand> {
    constructor(
        @Inject(TICKET_REPOSITORY)
        private readonly ticketRepository: ITicketRepository,
        private readonly policyService: TicketPolicyService,
        private readonly auditTrailService: AuditTrailService,
    ) {}

    /**
     * Assigns a ticket to an agent after authorization checks.
     *
     * @param command Assignment command payload.
     * @returns Assigned ticket identifier.
     */
    async execute(command: AssignTicketCommand): Promise<{ id: number; success: true }> {
        this.policyService.assertCanAssign(command.actorRole);

        const ticket = await this.ticketRepository.findById(command.ticketId);
        if (!ticket) {
            throw new NotFoundException('Ticket não encontrado');
        }
        await this.ticketRepository.assign(command.ticketId, command.dto.userId);
        await this.auditTrailService.record({
            action: 'ticket_assigned',
            aggregateType: 'ticket',
            aggregateId: command.ticketId.toString(),
            actorId: command.actorId,
            metadata: {
                assignedTo: command.dto.userId,
            },
        });

        return { id: command.ticketId, success: true };
    }
}
