import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AuditTrailService } from '../../../audit/services/audit-trail.service';
import { TicketAssignedEvent } from '../contracts';

@EventsHandler(TicketAssignedEvent)
export class AuditTicketAssignedHandler implements IEventHandler<TicketAssignedEvent> {
    constructor(private readonly auditTrailService: AuditTrailService) {}

    async handle(event: TicketAssignedEvent): Promise<void> {
        await this.auditTrailService.record({
            action: 'ticket_assigned',
            aggregateType: 'ticket',
            aggregateId: event.ticketId.toString(),
            actorId: event.assignedBy,
            metadata: {
                assignedTo: event.assignedTo,
            },
        });
    }
}
