import { type CommentPaginationParams } from '../../repositories/comment.repository.interface';

type GetCommentsFilter = CommentPaginationParams & {
    ticketId: number;
};

export class GetCommentsQuery {
    constructor(public readonly filter: GetCommentsFilter) {}
}
