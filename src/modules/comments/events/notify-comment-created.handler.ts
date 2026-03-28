import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { toStructuredLog } from '../../../common/logging/structured-log.helper';
import { OutboxService } from '../../outbox/outbox.service';
import { CommentCreatedEvent } from './comment-created.event';

@EventsHandler(CommentCreatedEvent)
export class NotifyCommentCreatedHandler implements IEventHandler<CommentCreatedEvent> {
    private readonly logger = new Logger(NotifyCommentCreatedHandler.name);

    constructor(private readonly outboxService: OutboxService) {}

    async handle(event: CommentCreatedEvent): Promise<void> {
        await this.outboxService.createPendingEvent({
            eventName: 'CommentNotificationRequestedEvent',
            aggregateType: 'notification',
            aggregateId: event.commentId.toString(),
            payload: {
                commentId: event.commentId,
                ticketId: event.ticketId,
                authorId: event.authorId,
            },
        });

        this.logger.log(
            toStructuredLog({
                level: 'info',
                action: 'comment_notification_enqueued',
                context: {
                    comment_id: event.commentId,
                    ticket_id: event.ticketId,
                    author_id: event.authorId,
                },
            }),
        );
    }
}
