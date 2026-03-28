import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

export const loginApiOperation = {
    summary: 'Authenticate user and issue JWT token',
    description: 'Validates CPF and password credentials and returns a Bearer token for protected endpoints.',
};

export const loginApiBody = {
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
};

export const loginApiCreatedResponse = {
    description: 'User authenticated successfully',
    schema: {
        example: {
            success: true,
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
    },
};

export const loginApiUnauthorizedResponse = {
    description: 'Invalid credentials',
    schema: {
        example: {
            success: false,
            message: 'Credenciais inválidas',
            code: 'UNAUTHORIZED',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const loginApiBadRequestResponse = {
    description: 'Validation error',
    schema: {
        example: {
            success: false,
            message: 'cpf must match /^\\d{11}$/ regular expression',
            code: 'BAD_REQUEST',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const loginApiTooManyRequestsResponse = {
    description: 'Too many authentication attempts',
    schema: {
        example: {
            success: false,
            message: 'ThrottlerException: Too Many Requests',
            code: 'TOO_MANY_REQUESTS',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const registerApiOperation = {
    summary: 'Register a new user account',
    description: 'Creates a new account with name, CPF, e-mail, and password.',
};

export const registerApiBody = {
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
};

export const registerApiCreatedResponse = {
    description: 'User registered successfully',
    schema: {
        example: {
            success: true,
            data: {
                id: 1,
            },
        },
    },
};

export const registerApiConflictResponse = {
    description: 'CPF or e-mail already registered',
    schema: {
        example: {
            success: false,
            message: 'CPF já cadastrado',
            code: 'CONFLICT',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const registerApiBadRequestResponse = {
    description: 'Validation error',
    schema: {
        example: {
            success: false,
            message: 'email must be an email',
            code: 'BAD_REQUEST',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const registerApiTooManyRequestsResponse = {
    description: 'Too many registration attempts',
    schema: {
        example: {
            success: false,
            message: 'ThrottlerException: Too Many Requests',
            code: 'TOO_MANY_REQUESTS',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const logoutApiOperation = {
    summary: 'Invalidate current authenticated session',
    description: 'Ends the current authenticated session.',
};

export const logoutApiCreatedResponse = {
    description: 'User logged out successfully',
    schema: {
        example: {
            success: true,
        },
    },
};

export const logoutApiUnauthorizedResponse = {
    description: 'Missing or invalid token',
    schema: {
        example: {
            success: false,
            message: 'Unauthorized',
            code: 'UNAUTHORIZED',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const logoutApiBadRequestResponse = {
    description: 'Malformed Authorization header',
    schema: {
        example: {
            success: false,
            message: 'Bad Request',
            code: 'BAD_REQUEST',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const meApiOperation = {
    summary: 'Get authenticated user profile',
    description: 'Returns profile data for the authenticated user from JWT context.',
};

export const meApiOkResponse = {
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
};

export const meApiUnauthorizedResponse = {
    description: 'Missing or invalid token',
    schema: {
        example: {
            success: false,
            message: 'Unauthorized',
            code: 'UNAUTHORIZED',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const meApiNotFoundResponse = {
    description: 'Authenticated user no longer exists',
    schema: {
        example: {
            success: false,
            message: 'Usuário não encontrado',
            code: 'NOT_FOUND',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};
