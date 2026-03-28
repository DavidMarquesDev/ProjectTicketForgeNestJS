import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommentsQuery } from './get-comments.query';
import { COMMENT_REPOSITORY, type ICommentRepository } from '../../repositories/comment.repository.interface';
import { Comment } from '../../entities/comment.entity';

type GetCommentsResult = {
    success: true;
    data: Comment[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

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
    async execute(query: GetCommentsQuery): Promise<GetCommentsResult> {
        const result = await this.commentRepository.paginateByTicket({
            ticketId: query.filter.ticketId,
            page: query.filter.page,
            limit: query.filter.limit,
            order: query.filter.order,
        });

        return {
            success: true,
            data: result.data,
            meta: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        };
    }
}
