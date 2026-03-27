import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TicketCreatedEvent } from './ticket-created.event';

@EventsHandler(TicketCreatedEvent)
export class SendNotificationHandler implements IEventHandler<TicketCreatedEvent> {
    handle(): void {}
}
