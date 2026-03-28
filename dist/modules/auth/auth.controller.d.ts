import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    login(dto: LoginDto): Promise<any>;
    register(dto: RegisterDto): Promise<any>;
    logout(user: AuthenticatedUser): Promise<any>;
    me(user: AuthenticatedUser): Promise<any>;
}
