import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { ICommentRepository } from './comment.repository.interface';

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

    async findByTicket(ticketId: number): Promise<Comment[]> {
        return this.ormRepository.find({
            where: { ticketId },
            relations: { author: true },
            order: { createdAt: 'DESC' },
        });
    }
}
