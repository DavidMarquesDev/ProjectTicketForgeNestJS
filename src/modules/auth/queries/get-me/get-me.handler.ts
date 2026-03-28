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

    /**
     * Fetches profile data for an authenticated user.
     *
     * @param query Query containing authenticated user id.
     * @returns Authenticated user profile data.
     * @throws NotFoundException When user does not exist.
     */
    async execute(query: GetMeQuery): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: query.userId },
            select: ['id', 'name', 'cpf', 'email', 'role', 'createdAt', 'updatedAt'],
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        return user;
    }
}
