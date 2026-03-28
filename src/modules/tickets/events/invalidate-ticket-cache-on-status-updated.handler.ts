import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TicketReadCacheService } from '../services/ticket-read-cache.service';
import { TicketStatusUpdatedEvent } from './ticket-status-updated.event';

@EventsHandler(TicketStatusUpdatedEvent)
export class InvalidateTicketCacheOnStatusUpdatedHandler implements IEventHandler<TicketStatusUpdatedEvent> {
    constructor(private readonly ticketReadCacheService: TicketReadCacheService) {}

    async handle(event: TicketStatusUpdatedEvent): Promise<void> {
        this.ticketReadCacheService.invalidate(event.ticketId);
    }
}

