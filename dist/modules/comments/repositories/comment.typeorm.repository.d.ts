import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { ICommentRepository } from './comment.repository.interface';
export declare class CommentTypeOrmRepository implements ICommentRepository {
    private readonly ormRepository;
    constructor(ormRepository: Repository<Comment>);
    createAndSave(input: {
        ticketId: number;
        authorId: number;
        content: string;
    }): Promise<Comment>;
    findByTicket(ticketId: number): Promise<Comment[]>;
}
