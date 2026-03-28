import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommentsQuery } from './get-comments.query';
import { COMMENT_REPOSITORY, type ICommentRepository } from '../../repositories/comment.repository.interface';
import { Comment } from '../../entities/comment.entity';

@QueryHandler(GetCommentsQuery)
export class GetCommentsHandler implements IQueryHandler<GetCommentsQuery> {
    constructor(
        @Inject(COMMENT_REPOSITORY)
        private readonly commentRepository: ICommentRepository,
    ) {}

    /**
     * Lists comments by ticket id.
     *
     * @param query Query containing ticket identifier.
     * @returns Ticket comments payload.
     */
    async execute(query: GetCommentsQuery): Promise<{ success: true; data: Comment[] }> {
        const comments = await this.commentRepository.findByTicket(query.ticketId);
        return { success: true, data: comments };
    }
}
