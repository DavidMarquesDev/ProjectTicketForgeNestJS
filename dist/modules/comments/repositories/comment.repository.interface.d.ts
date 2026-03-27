import { Comment } from '../entities/comment.entity';
export declare const COMMENT_REPOSITORY: unique symbol;
export interface ICommentRepository {
    createAndSave(input: {
        ticketId: number;
        authorId: number;
        content: string;
    }): Promise<Comment>;
    findByTicket(ticketId: number): Promise<Comment[]>;
}
