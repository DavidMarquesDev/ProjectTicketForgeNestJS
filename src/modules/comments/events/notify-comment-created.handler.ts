import { CommentCreatedEvent } from './comment-created.event';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

@EventsHandler(CommentCreatedEvent)
export class NotifyCommentCreatedHandler implements IEventHandler<CommentCreatedEvent> {
    handle(): void {}
}
