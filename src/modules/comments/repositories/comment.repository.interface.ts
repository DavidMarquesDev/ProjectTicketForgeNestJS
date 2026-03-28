import { Comment } from '../entities/comment.entity';

export const COMMENT_REPOSITORY = Symbol('COMMENT_REPOSITORY');

export enum CommentSortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export type CommentPaginationParams = {
    ticketId: number;
    page: number;
    limit: number;
    order?: CommentSortOrder;
};

export type PaginatedComments = {
    data: Comment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export interface ICommentRepository {
    createAndSave(input: { ticketId: number; authorId: number; content: string }): Promise<Comment>;
    findById(commentId: number): Promise<Comment | null>;
    save(comment: Comment): Promise<Comment>;
    deleteById(commentId: number): Promise<void>;
    findByTicket(ticketId: number): Promise<Comment[]>;
    paginateByTicket(params: CommentPaginationParams): Promise<PaginatedComments>;
}
