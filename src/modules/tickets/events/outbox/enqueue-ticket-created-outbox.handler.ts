import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OutboxService } from '../../../outbox/outbox.service';
import { TicketCreatedEvent } from '../contracts';

@EventsHandler(TicketCreatedEvent)
export class EnqueueTicketCreatedOutboxHandler implements IEventHandler<TicketCreatedEvent> {
    constructor(private readonly outboxService: OutboxService) {}

    async handle(event: TicketCreatedEvent): Promise<void> {
        await this.outboxService.createPendingEvent({
            eventName: 'TicketCreatedEvent',
            aggregateType: 'ticket',
            aggregateId: event.ticketId.toString(),
            payload: {
                ticketId: event.ticketId,
                createdBy: event.createdBy,
            },
        });
    }
}
