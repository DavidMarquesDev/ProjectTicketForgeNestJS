import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    login(dto: LoginDto): Promise<any>;
    logout(user: AuthenticatedUser): Promise<any>;
    me(user: AuthenticatedUser): Promise<any>;
}
