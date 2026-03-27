import { IQueryHandler } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { GetMeQuery } from './get-me.query';
export declare class GetMeHandler implements IQueryHandler<GetMeQuery> {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    execute(query: GetMeQuery): Promise<User>;
}
