import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OutboxService } from '../../../outbox/outbox.service';
import { TicketStatusUpdatedEvent } from '../contracts';

@EventsHandler(TicketStatusUpdatedEvent)
export class EnqueueTicketStatusUpdatedOutboxHandler implements IEventHandler<TicketStatusUpdatedEvent> {
    constructor(private readonly outboxService: OutboxService) {}

    async handle(event: TicketStatusUpdatedEvent): Promise<void> {
        await this.outboxService.createPendingEvent({
            eventName: 'TicketStatusUpdatedEvent',
            aggregateType: 'ticket',
            aggregateId: event.ticketId.toString(),
            payload: {
                ticketId: event.ticketId,
                status: event.status,
                updatedBy: event.updatedBy,
            },
        });
    }
}
