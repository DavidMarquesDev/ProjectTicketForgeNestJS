import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OutboxService } from '../../../outbox/outbox.service';
import { CommentCreatedEvent } from '../contracts';

@EventsHandler(CommentCreatedEvent)
export class EnqueueCommentCreatedOutboxHandler implements IEventHandler<CommentCreatedEvent> {
    constructor(private readonly outboxService: OutboxService) {}

    async handle(event: CommentCreatedEvent): Promise<void> {
        await this.outboxService.createPendingEvent({
            eventName: 'CommentCreatedEvent',
            aggregateType: 'comment',
            aggregateId: event.commentId.toString(),
            payload: {
                commentId: event.commentId,
                ticketId: event.ticketId,
                authorId: event.authorId,
            },
        });
    }
}
