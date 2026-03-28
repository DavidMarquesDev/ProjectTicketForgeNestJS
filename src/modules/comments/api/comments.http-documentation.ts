import { CreateCommentDto } from '../dto/create-comment.dto';

export const createCommentApiOperation = {
    summary: 'Create a comment for a ticket',
    description: 'Creates a comment for an existing ticket using authenticated user context.',
};

export const commentsApiParam = {
    name: 'ticketId',
    example: 101,
    description: 'Ticket identifier',
};

export const createCommentApiBody = {
    type: CreateCommentDto,
    description: 'Comment payload',
    examples: {
        valid: {
            summary: 'Valid comment',
            value: {
                content: 'Issue acknowledged. Working on a fix.',
            },
        },
    },
};

export const createCommentApiCreatedResponse = {
    description: 'Comment created successfully',
    schema: {
        example: {
            id: 3001,
            success: true,
        },
    },
};

export const commentsApiUnauthorizedResponse = {
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

export const commentsApiNotFoundResponse = {
    description: 'Ticket not found',
    schema: {
        example: {
            success: false,
            message: 'Ticket não encontrado',
            code: 'NOT_FOUND',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const createCommentApiBadRequestResponse = {
    description: 'Validation error',
    schema: {
        example: {
            success: false,
            message: 'content must be longer than or equal to 2 characters',
            code: 'BAD_REQUEST',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const listCommentsApiOperation = {
    summary: 'List comments by ticket',
    description: 'Returns all comments linked to a specific ticket.',
};

export const listCommentsApiOkResponse = {
    description: 'Comments returned successfully',
    schema: {
        example: {
            success: true,
            data: [
                {
                    id: 3001,
                    ticketId: 101,
                    authorId: 1,
                    content: 'Issue acknowledged. Working on a fix.',
                    createdAt: '2026-03-27T12:00:00.000Z',
                },
            ],
        },
    },
};

export const listCommentsApiBadRequestResponse = {
    description: 'Validation error',
    schema: {
        example: {
            success: false,
            message: 'Validation failed (numeric string is expected)',
            code: 'BAD_REQUEST',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};
