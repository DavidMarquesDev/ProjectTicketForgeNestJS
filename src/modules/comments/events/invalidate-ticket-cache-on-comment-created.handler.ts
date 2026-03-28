import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TicketReadCacheService } from '../../tickets/services/ticket-read-cache.service';
import { CommentCreatedEvent } from './comment-created.event';

@EventsHandler(CommentCreatedEvent)
export class InvalidateTicketCacheOnCommentCreatedHandler implements IEventHandler<CommentCreatedEvent> {
    constructor(private readonly ticketReadCacheService: TicketReadCacheService) {}

    async handle(event: CommentCreatedEvent): Promise<void> {
        this.ticketReadCacheService.invalidate(event.ticketId);
    }
}

