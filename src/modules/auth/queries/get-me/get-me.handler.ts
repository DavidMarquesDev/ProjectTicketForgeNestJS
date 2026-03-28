import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { User } from '../../entities/user.entity';
import { IUserRepository, USER_REPOSITORY } from '../../repositories/user.repository.interface';
import { GetMeQuery } from './get-me.query';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    /**
     * Fetches profile data for an authenticated user.
     *
     * @param query Query containing authenticated user id.
     * @returns Authenticated user profile data.
     * @throws NotFoundException When user does not exist.
     */
    async execute(query: GetMeQuery): Promise<User> {
        const user = await this.userRepository.findProfileById(query.userId);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        return user;
    }
}
