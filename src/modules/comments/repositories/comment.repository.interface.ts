import { Comment } from '../entities/comment.entity';

export const COMMENT_REPOSITORY = Symbol('COMMENT_REPOSITORY');

export interface ICommentRepository {
    createAndSave(input: { ticketId: number; authorId: number; content: string }): Promise<Comment>;
    findByTicket(ticketId: number): Promise<Comment[]>;
}
