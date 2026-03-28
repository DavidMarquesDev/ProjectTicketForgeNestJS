import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';

export const createCommentApiOperation = {
    summary: 'Create a comment for a ticket',
    description: 'Creates a comment for an existing ticket using authenticated user context.',
};

export const commentsApiParam = {
    name: 'ticketId',
    example: 101,
    description: 'Ticket identifier',
};

export const commentIdApiParam = {
    name: 'id',
    example: 3001,
    description: 'Comment identifier',
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

export const commentApiNotFoundResponse = {
    description: 'Comment not found',
    schema: {
        example: {
            success: false,
            message: 'Comentário não encontrado',
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

export const updateCommentApiOperation = {
    summary: 'Update an existing comment',
    description: 'Updates comment content when actor is the author or admin.',
};

export const updateCommentApiBody = {
    type: UpdateCommentDto,
    description: 'Comment update payload',
    examples: {
        valid: {
            summary: 'Valid update',
            value: {
                content: 'Atualização: correção aplicada e aguardando validação.',
            },
        },
    },
};

export const updateCommentApiOkResponse = {
    description: 'Comment updated successfully',
    schema: {
        example: {
            id: 3001,
            success: true,
        },
    },
};

export const updateCommentApiForbiddenResponse = {
    description: 'User has no permission to update the comment',
    schema: {
        example: {
            success: false,
            message: 'Usuário não possui permissão para editar comentário',
            code: 'FORBIDDEN',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const deleteCommentApiOperation = {
    summary: 'Delete a comment',
    description: 'Deletes comment when actor is the author or admin.',
};

export const deleteCommentApiOkResponse = {
    description: 'Comment deleted successfully',
    schema: {
        example: {
            id: 3001,
            success: true,
        },
    },
};

export const deleteCommentApiForbiddenResponse = {
    description: 'User has no permission to delete the comment',
    schema: {
        example: {
            success: false,
            message: 'Usuário não possui permissão para excluir comentário',
            code: 'FORBIDDEN',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const listCommentsApiOperation = {
    summary: 'List comments by ticket',
    description: 'Returns paginated comments linked to a specific ticket.',
};

export const listCommentsApiPageQuery = {
    name: 'page',
    required: false,
    example: 1,
    description: 'Current page number',
};

export const listCommentsApiLimitQuery = {
    name: 'limit',
    required: false,
    example: 20,
    description: 'Page size (maximum 100)',
};

export const listCommentsApiOrderQuery = {
    name: 'order',
    required: false,
    example: 'DESC',
    description: 'Sort order by creation date',
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
            meta: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
            },
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
