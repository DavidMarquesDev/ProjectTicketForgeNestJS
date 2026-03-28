import { AssignTicketDto } from '../dto/assign-ticket.dto';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';

export const createTicketApiOperation = {
    summary: 'Create a new ticket',
    description: 'Creates a ticket using title and description for the authenticated user.',
};

export const createTicketApiBody = {
    type: CreateTicketDto,
    description: 'Ticket creation payload',
    examples: {
        valid: {
            summary: 'Valid ticket',
            value: {
                title: 'Payment gateway timeout',
                description: 'Users report timeout when confirming card payment in checkout.',
            },
        },
    },
};

export const ticketApiUnauthorizedResponse = {
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

export const createTicketApiCreatedResponse = {
    description: 'Ticket created successfully',
    schema: {
        example: {
            id: 101,
            success: true,
        },
    },
};

export const createTicketApiBadRequestResponse = {
    description: 'Validation error',
    schema: {
        example: {
            success: false,
            message: 'description must be longer than or equal to 10 characters',
            code: 'BAD_REQUEST',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const updateStatusApiOperation = {
    summary: 'Update ticket status',
    description: 'Updates status according to transition rules and authorization policy.',
};

export const updateStatusApiParam = {
    name: 'id',
    example: 101,
    description: 'Ticket identifier',
};

export const updateStatusApiBody = {
    type: UpdateStatusDto,
    description: 'New ticket status payload',
    examples: {
        valid: {
            summary: 'Move OPEN to IN_PROGRESS',
            value: {
                status: 'in_progress',
            },
        },
    },
};

export const updateStatusApiOkResponse = {
    description: 'Ticket status updated successfully',
    schema: {
        example: {
            id: 101,
            success: true,
        },
    },
};

export const updateStatusApiForbiddenResponse = {
    description: 'User has no permission to update status',
    schema: {
        example: {
            success: false,
            message: 'Usuário não possui permissão para atualizar status',
            code: 'FORBIDDEN',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const ticketApiNotFoundResponse = {
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

export const updateStatusApiBadRequestResponse = {
    description: 'Validation error',
    schema: {
        example: {
            success: false,
            message: 'status must be a valid enum value',
            code: 'BAD_REQUEST',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const assignTicketApiOperation = {
    summary: 'Assign ticket to a user',
    description: 'Assigns a ticket to another user when actor role is support or admin.',
};

export const assignTicketApiBody = {
    type: AssignTicketDto,
    description: 'Target assignee payload',
    examples: {
        valid: {
            summary: 'Assign to support user',
            value: {
                userId: 2,
            },
        },
    },
};

export const assignTicketApiOkResponse = {
    description: 'Ticket assigned successfully',
    schema: {
        example: {
            id: 101,
            success: true,
        },
    },
};

export const assignTicketApiForbiddenResponse = {
    description: 'User has no permission to assign ticket',
    schema: {
        example: {
            success: false,
            message: 'Apenas suporte ou admin podem atribuir ticket',
            code: 'FORBIDDEN',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const assignTicketApiBadRequestResponse = {
    description: 'Validation error',
    schema: {
        example: {
            success: false,
            message: 'userId must not be less than 1',
            code: 'BAD_REQUEST',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const listTicketsApiOperation = {
    summary: 'List tickets with pagination and filters',
    description: 'Returns paginated tickets filtered by optional status and assignee.',
};

export const listTicketsApiOkResponse = {
    description: 'Tickets returned successfully',
    schema: {
        example: {
            success: true,
            data: [
                {
                    id: 101,
                    title: 'Payment gateway timeout',
                    description: 'Users report timeout when confirming card payment in checkout.',
                    status: 'open',
                    createdBy: 1,
                    assignedTo: 2,
                    createdAt: '2026-03-27T12:00:00.000Z',
                    updatedAt: '2026-03-27T12:00:00.000Z',
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

export const listTicketsApiBadRequestResponse = {
    description: 'Validation error',
    schema: {
        example: {
            success: false,
            message: 'limit must not be greater than 100',
            code: 'BAD_REQUEST',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const getTicketApiOperation = {
    summary: 'Get ticket details by id',
    description: 'Returns one detailed ticket, including relational data when available.',
};

export const getTicketApiOkResponse = {
    description: 'Ticket details returned successfully',
    schema: {
        example: {
            success: true,
            data: {
                id: 101,
                title: 'Payment gateway timeout',
                description: 'Users report timeout when confirming card payment in checkout.',
                status: 'open',
                createdBy: 1,
                assignedTo: 2,
                createdAt: '2026-03-27T12:00:00.000Z',
                updatedAt: '2026-03-27T12:00:00.000Z',
            },
        },
    },
};

export const getTicketApiBadRequestResponse = {
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
