import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { toStructuredLog } from '../../../common/logging/structured-log.helper';
import { CommentCreatedEvent } from './comment-created.event';

@EventsHandler(CommentCreatedEvent)
export class NotifyCommentCreatedHandler implements IEventHandler<CommentCreatedEvent> {
    private readonly logger = new Logger(NotifyCommentCreatedHandler.name);

    handle(event: CommentCreatedEvent): void {
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
