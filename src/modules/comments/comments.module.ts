import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdempotencyModule } from '../idempotency/idempotency.module';
import { OutboxModule } from '../outbox/outbox.module';
import { TicketsModule } from '../tickets/tickets.module';
import { CreateCommentHandler } from './commands/create-comment/create-comment.handler';
import { DeleteCommentHandler } from './commands/delete-comment/delete-comment.handler';
import { UpdateCommentHandler } from './commands/update-comment/update-comment.handler';
import { CommentsController } from './comments.controller';
import { AuditCommentDeletedHandler } from './events/audit/audit-comment-deleted.handler';
import { AuditCommentUpdatedHandler } from './events/audit/audit-comment-updated.handler';
import { InvalidateTicketCacheOnCommentCreatedHandler } from './events/cache/invalidate-ticket-cache-on-comment-created.handler';
import { NotifyCommentCreatedHandler } from './events/notification/notify-comment-created.handler';
import { EnqueueCommentCreatedOutboxHandler } from './events/outbox/enqueue-comment-created-outbox.handler';
import { Comment } from './entities/comment.entity';
import { CommentPolicyService } from './policies/comment-policy.service';
import { GetCommentsHandler } from './queries/get-comments/get-comments.handler';
import { COMMENT_REPOSITORY } from './repositories/comment.repository.interface';
import { CommentTypeOrmRepository } from './repositories/comment.typeorm.repository';

const commandHandlers = [CreateCommentHandler, UpdateCommentHandler, DeleteCommentHandler];
const queryHandlers = [GetCommentsHandler];
const eventHandlers = [
    NotifyCommentCreatedHandler,
    InvalidateTicketCacheOnCommentCreatedHandler,
    AuditCommentUpdatedHandler,
    AuditCommentDeletedHandler,
    EnqueueCommentCreatedOutboxHandler,
];

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([Comment]), TicketsModule, OutboxModule, IdempotencyModule],
    controllers: [CommentsController],
    providers: [
        CommentPolicyService,
        CommentTypeOrmRepository,
        {
            provide: COMMENT_REPOSITORY,
            useExisting: CommentTypeOrmRepository,
        },
        ...commandHandlers,
        ...queryHandlers,
        ...eventHandlers,
    ],
})
export class CommentsModule {}
