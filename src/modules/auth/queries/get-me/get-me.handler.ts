import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { GetMeQuery } from './get-me.query';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery> {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async execute(query: GetMeQuery): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: query.userId },
            select: ['id', 'email', 'role', 'createdAt', 'updatedAt'],
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        return user;
    }
}
