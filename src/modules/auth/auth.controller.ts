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
    @ApiOperation({
        summary: 'Authenticate user and issue JWT token',
        description:
            'Validates CPF and password credentials and returns a Bearer token for protected endpoints.',
    })
    @ApiBody({
        description: 'Authentication payload',
        type: LoginDto,
        examples: {
            valid: {
                summary: 'Valid credentials',
                value: {
                    cpf: '12345678901',
                    password: '12345678',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'User authenticated successfully',
        schema: {
            example: {
                success: true,
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid credentials',
        schema: {
            example: {
                success: false,
                message: 'Credenciais inválidas',
                code: 'UNAUTHORIZED',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Validation error',
        schema: {
            example: {
                success: false,
                message: 'cpf must match /^\\d{11}$/ regular expression',
                code: 'BAD_REQUEST',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @ApiTooManyRequestsResponse({
        description: 'Too many authentication attempts',
        schema: {
            example: {
                success: false,
                message: 'ThrottlerException: Too Many Requests',
                code: 'TOO_MANY_REQUESTS',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
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
    @ApiOperation({
        summary: 'Register a new user account',
        description: 'Creates a new account with name, CPF, e-mail, and password.',
    })
    @ApiBody({
        description: 'Registration payload',
        type: RegisterDto,
        examples: {
            valid: {
                summary: 'Valid registration',
                value: {
                    name: 'João da Silva',
                    cpf: '12345678901',
                    email: 'joao@email.com',
                    password: '12345678',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'User registered successfully',
        schema: {
            example: {
                success: true,
                data: {
                    id: 1,
                    name: 'João da Silva',
                    cpf: '12345678901',
                    email: 'joao@email.com',
                    role: 'user',
                },
            },
        },
    })
    @ApiConflictResponse({
        description: 'CPF or e-mail already registered',
        schema: {
            example: {
                success: false,
                message: 'CPF já cadastrado',
                code: 'CONFLICT',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Validation error',
        schema: {
            example: {
                success: false,
                message: 'email must be an email',
                code: 'BAD_REQUEST',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @ApiTooManyRequestsResponse({
        description: 'Too many registration attempts',
        schema: {
            example: {
                success: false,
                message: 'ThrottlerException: Too Many Requests',
                code: 'TOO_MANY_REQUESTS',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.commandBus.execute(new RegisterCommand(dto.name, dto.cpf, dto.email, dto.password));
    }

    /**
     * Logs out the authenticated user.
     *
     * @param user Authenticated user extracted from JWT.
     * @returns Logout confirmation.
     */
    @ApiOperation({
        summary: 'Invalidate current authenticated session',
        description: 'Ends the current authenticated session.',
    })
    @ApiCreatedResponse({
        description: 'User logged out successfully',
        schema: {
            example: {
                success: true,
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Missing or invalid token',
        schema: {
            example: {
                success: false,
                message: 'Unauthorized',
                code: 'UNAUTHORIZED',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Malformed Authorization header',
        schema: {
            example: {
                success: false,
                message: 'Bad Request',
                code: 'BAD_REQUEST',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
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
    @ApiOperation({
        summary: 'Get authenticated user profile',
        description: 'Returns profile data for the authenticated user from JWT context.',
    })
    @ApiOkResponse({
        description: 'Authenticated user data returned successfully',
        schema: {
            example: {
                id: 1,
                name: 'João da Silva',
                cpf: '12345678901',
                email: 'joao@email.com',
                role: 'user',
                createdAt: '2026-03-27T12:00:00.000Z',
                updatedAt: '2026-03-27T12:00:00.000Z',
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Missing or invalid token',
        schema: {
            example: {
                success: false,
                message: 'Unauthorized',
                code: 'UNAUTHORIZED',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'Authenticated user no longer exists',
        schema: {
            example: {
                success: false,
                message: 'Usuário não encontrado',
                code: 'NOT_FOUND',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('me')
    me(@CurrentUser() user: AuthenticatedUser) {
        return this.queryBus.execute(new GetMeQuery(user.id));
    }
}
