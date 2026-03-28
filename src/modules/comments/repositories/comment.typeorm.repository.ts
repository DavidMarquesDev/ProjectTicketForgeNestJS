import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import {
    CommentSortOrder,
    ICommentRepository,
    type CommentPaginationParams,
    type PaginatedComments,
} from './comment.repository.interface';

@Injectable()
export class CommentTypeOrmRepository implements ICommentRepository {
    constructor(
        @InjectRepository(Comment)
        private readonly ormRepository: Repository<Comment>,
    ) {}

    async createAndSave(input: { ticketId: number; authorId: number; content: string }): Promise<Comment> {
        const comment = this.ormRepository.create({
            ticketId: input.ticketId,
            authorId: input.authorId,
            content: input.content,
        });
        return this.ormRepository.save(comment);
    }

    async findById(commentId: number): Promise<Comment | null> {
        return this.ormRepository.findOne({
            where: { id: commentId },
        });
    }

    async save(comment: Comment): Promise<Comment> {
        return this.ormRepository.save(comment);
    }

    async deleteById(commentId: number): Promise<void> {
        await this.ormRepository.delete({ id: commentId });
    }

    async findByTicket(ticketId: number): Promise<Comment[]> {
        return this.ormRepository.find({
            where: { ticketId },
            order: { createdAt: 'DESC' },
        });
    }

    async paginateByTicket(params: CommentPaginationParams): Promise<PaginatedComments> {
        const order = params.order ?? CommentSortOrder.DESC;
        const skip = (params.page - 1) * params.limit;
        const queryBuilder = this.ormRepository
            .createQueryBuilder('comment')
            .select([
                'comment.id',
                'comment.ticketId',
                'comment.authorId',
                'comment.content',
                'comment.createdAt',
            ])
            .where('comment.ticketId = :ticketId', { ticketId: params.ticketId })
            .orderBy('comment.createdAt', order)
            .skip(skip)
            .take(params.limit);

        const [data, total] = await queryBuilder.getManyAndCount();
        const totalPages = Math.ceil(total / params.limit) || 1;

        return {
            data,
            total,
            page: params.page,
            limit: params.limit,
            totalPages,
        };
    }
}
