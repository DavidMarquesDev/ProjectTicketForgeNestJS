import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LoginCommand } from './commands/login/login.command';
import { LogoutCommand } from './commands/logout/logout.command';
import { LoginDto } from './dto/login.dto';
import { GetMeQuery } from './queries/get-me/get-me.query';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.commandBus.execute(new LoginCommand(dto.email, dto.password));
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('logout')
    logout(@CurrentUser() user: AuthenticatedUser) {
        return this.commandBus.execute(new LogoutCommand(user.id));
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('me')
    me(@CurrentUser() user: AuthenticatedUser) {
        return this.queryBus.execute(new GetMeQuery(user.id));
    }
}
