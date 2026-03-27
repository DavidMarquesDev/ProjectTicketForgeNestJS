import { IQueryHandler } from '@nestjs/cqrs';
import { GetCommentsQuery } from './get-comments.query';
import { type ICommentRepository } from '../../repositories/comment.repository.interface';
import { Comment } from '../../entities/comment.entity';
export declare class GetCommentsHandler implements IQueryHandler<GetCommentsQuery> {
    private readonly commentRepository;
    constructor(commentRepository: ICommentRepository);
    execute(query: GetCommentsQuery): Promise<{
        success: true;
        data: Comment[];
    }>;
}
