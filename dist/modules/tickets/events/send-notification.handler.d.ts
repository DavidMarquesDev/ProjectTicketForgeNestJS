import { IEventHandler } from '@nestjs/cqrs';
import { TicketCreatedEvent } from './ticket-created.event';
export declare class SendNotificationHandler implements IEventHandler<TicketCreatedEvent> {
    handle(): void;
}
