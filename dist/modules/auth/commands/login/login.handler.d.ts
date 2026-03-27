import { ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { LoginCommand } from './login.command';
type LoginResult = {
    token: string;
    success: true;
};
export declare class LoginHandler implements ICommandHandler<LoginCommand> {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    execute(command: LoginCommand): Promise<LoginResult>;
}
export {};
