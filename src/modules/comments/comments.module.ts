import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsModule } from '../tickets/tickets.module';
import { CreateCommentHandler } from './commands/create-comment/create-comment.handler';
import { CommentsController } from './comments.controller';
import { NotifyCommentCreatedHandler } from './events/notify-comment-created.handler';
import { Comment } from './entities/comment.entity';
import { GetCommentsHandler } from './queries/get-comments/get-comments.handler';
import { COMMENT_REPOSITORY } from './repositories/comment.repository.interface';
import { CommentTypeOrmRepository } from './repositories/comment.typeorm.repository';

const commandHandlers = [CreateCommentHandler];
const queryHandlers = [GetCommentsHandler];
const eventHandlers = [NotifyCommentCreatedHandler];

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([Comment]), TicketsModule],
    controllers: [CommentsController],
    providers: [
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
