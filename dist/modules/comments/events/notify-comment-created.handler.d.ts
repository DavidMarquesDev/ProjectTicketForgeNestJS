import { CommentCreatedEvent } from './comment-created.event';
import { IEventHandler } from '@nestjs/cqrs';
export declare class NotifyCommentCreatedHandler implements IEventHandler<CommentCreatedEvent> {
    handle(_: CommentCreatedEvent): void;
}
