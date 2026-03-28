import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AuditTrailService } from '../../../audit/services/audit-trail.service';
import { TicketStatusUpdatedEvent } from '../contracts';

@EventsHandler(TicketStatusUpdatedEvent)
export class AuditTicketStatusUpdatedHandler implements IEventHandler<TicketStatusUpdatedEvent> {
    constructor(private readonly auditTrailService: AuditTrailService) {}

    async handle(event: TicketStatusUpdatedEvent): Promise<void> {
        await this.auditTrailService.record({
            action: 'ticket_status_updated',
            aggregateType: 'ticket',
            aggregateId: event.ticketId.toString(),
            actorId: event.updatedBy,
            metadata: {
                status: event.status,
            },
        });
    }
}
