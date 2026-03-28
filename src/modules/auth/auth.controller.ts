import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiExtraModels,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTooManyRequestsResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
    loginApiBadRequestResponse,
    loginApiBody,
    loginApiCreatedResponse,
    loginApiOperation,
    loginApiTooManyRequestsResponse,
    loginApiUnauthorizedResponse,
    logoutApiBadRequestResponse,
    logoutApiCreatedResponse,
    logoutApiOperation,
    logoutApiUnauthorizedResponse,
    meApiNotFoundResponse,
    meApiOkResponse,
    meApiOperation,
    meApiUnauthorizedResponse,
    registerApiBadRequestResponse,
    registerApiBody,
    registerApiConflictResponse,
    registerApiCreatedResponse,
    registerApiOperation,
    registerApiTooManyRequestsResponse,
} from './api/auth.http-documentation';
import { LoginCommand } from './commands/login/login.command';
import { LogoutCommand } from './commands/logout/logout.command';
import { RegisterCommand } from './commands/register/register.command';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GetMeQuery } from './queries/get-me/get-me.query';

@ApiTags('auth')
@ApiExtraModels(LoginDto, RegisterDto)
@Controller('auth')
export class AuthController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    /**
     * Authenticates a user with CPF and password.
     *
     * @param dto Login payload with CPF and password.
     * @returns JWT token used in protected endpoints.
     */
    @ApiOperation(loginApiOperation)
    @ApiBody(loginApiBody)
    @ApiCreatedResponse(loginApiCreatedResponse)
    @ApiUnauthorizedResponse(loginApiUnauthorizedResponse)
    @ApiBadRequestResponse(loginApiBadRequestResponse)
    @ApiTooManyRequestsResponse(loginApiTooManyRequestsResponse)
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.commandBus.execute(new LoginCommand(dto.cpf, dto.password));
    }

    /**
     * Registers a new user account.
     *
     * @param dto Registration payload.
     * @returns Created user data.
     */
    @ApiOperation(registerApiOperation)
    @ApiBody(registerApiBody)
    @ApiCreatedResponse(registerApiCreatedResponse)
    @ApiConflictResponse(registerApiConflictResponse)
    @ApiBadRequestResponse(registerApiBadRequestResponse)
    @ApiTooManyRequestsResponse(registerApiTooManyRequestsResponse)
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.commandBus.execute(new RegisterCommand(dto));
    }

    /**
     * Logs out the authenticated user.
     *
     * @param user Authenticated user extracted from JWT.
     * @returns Logout confirmation.
     */
    @ApiOperation(logoutApiOperation)
    @ApiCreatedResponse(logoutApiCreatedResponse)
    @ApiUnauthorizedResponse(logoutApiUnauthorizedResponse)
    @ApiBadRequestResponse(logoutApiBadRequestResponse)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('logout')
    logout(@CurrentUser() user: AuthenticatedUser) {
        return this.commandBus.execute(new LogoutCommand(user.id));
    }

    /**
     * Returns profile data of the authenticated user.
     *
     * @param user Authenticated user extracted from JWT.
     * @returns User profile data.
     */
    @ApiOperation(meApiOperation)
    @ApiOkResponse(meApiOkResponse)
    @ApiUnauthorizedResponse(meApiUnauthorizedResponse)
    @ApiNotFoundResponse(meApiNotFoundResponse)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('me')
    me(@CurrentUser() user: AuthenticatedUser) {
        return this.queryBus.execute(new GetMeQuery(user.id));
    }
}
