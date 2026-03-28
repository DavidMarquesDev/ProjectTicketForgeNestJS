import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AssignTicketCommand } from './commands/assign-ticket/assign-ticket.command';
import { CreateTicketCommand } from './commands/create-ticket/create-ticket.command';
import { UpdateStatusCommand } from './commands/update-status/update-status.command';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { GetTicketsQueryDto } from './dto/get-tickets-query.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { GetTicketQuery } from './queries/get-ticket/get-ticket.query';
import { GetTicketsQuery } from './queries/get-tickets/get-tickets.query';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    /**
     * Creates a new ticket owned by the authenticated user.
     *
     * @param dto Ticket creation payload.
     * @param user Authenticated user extracted from JWT.
     * @returns Created ticket identifier.
     */
    @ApiOperation({
        summary: 'Create a new ticket',
        description: 'Creates a ticket using title and description for the authenticated user.',
    })
    @ApiBody({
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
    })
    @ApiCreatedResponse({
        description: 'Ticket created successfully',
        schema: {
            example: {
                id: 101,
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
        description: 'Validation error',
        schema: {
            example: {
                success: false,
                message: 'description must be longer than or equal to 10 characters',
                code: 'BAD_REQUEST',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @Post()
    create(@Body() dto: CreateTicketDto, @CurrentUser() user: AuthenticatedUser) {
        return this.commandBus.execute(new CreateTicketCommand(dto, user.id));
    }

    /**
     * Updates the status of a ticket when transition and authorization are valid.
     *
     * @param id Ticket identifier.
     * @param dto Status transition payload.
     * @param user Authenticated user extracted from JWT.
     * @returns Updated ticket identifier.
     */
    @ApiOperation({
        summary: 'Update ticket status',
        description: 'Updates status according to transition rules and authorization policy.',
    })
    @ApiParam({ name: 'id', example: 101, description: 'Ticket identifier' })
    @ApiBody({
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
    })
    @ApiOkResponse({
        description: 'Ticket status updated successfully',
        schema: {
            example: {
                id: 101,
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
    @ApiForbiddenResponse({
        description: 'User has no permission to update status',
        schema: {
            example: {
                success: false,
                message: 'Usuário não possui permissão para atualizar status',
                code: 'FORBIDDEN',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'Ticket not found',
        schema: {
            example: {
                success: false,
                message: 'Ticket não encontrado',
                code: 'NOT_FOUND',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Validation error',
        schema: {
            example: {
                success: false,
                message: 'status must be a valid enum value',
                code: 'BAD_REQUEST',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @Patch(':id/status')
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateStatusDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.commandBus.execute(new UpdateStatusCommand(id, dto, user.id, user.role));
    }

    /**
     * Assigns a ticket to a user when the actor has permission.
     *
     * @param id Ticket identifier.
     * @param dto Assignment payload.
     * @param user Authenticated user extracted from JWT.
     * @returns Updated ticket identifier.
     */
    @ApiOperation({
        summary: 'Assign ticket to a user',
        description: 'Assigns a ticket to another user when actor role is support or admin.',
    })
    @ApiParam({ name: 'id', example: 101, description: 'Ticket identifier' })
    @ApiBody({
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
    })
    @ApiOkResponse({
        description: 'Ticket assigned successfully',
        schema: {
            example: {
                id: 101,
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
    @ApiForbiddenResponse({
        description: 'User has no permission to assign ticket',
        schema: {
            example: {
                success: false,
                message: 'Apenas suporte ou admin podem atribuir ticket',
                code: 'FORBIDDEN',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'Ticket not found',
        schema: {
            example: {
                success: false,
                message: 'Ticket não encontrado',
                code: 'NOT_FOUND',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Validation error',
        schema: {
            example: {
                success: false,
                message: 'userId must not be less than 1',
                code: 'BAD_REQUEST',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @Patch(':id/assign')
    assign(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AssignTicketDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.commandBus.execute(new AssignTicketCommand(id, dto, user.role));
    }

    /**
     * Returns a paginated list of tickets.
     *
     * @param query Ticket filters and pagination params.
     * @returns Paginated list of tickets.
     */
    @ApiOperation({
        summary: 'List tickets with pagination and filters',
        description: 'Returns paginated tickets filtered by optional status and assignee.',
    })
    @ApiQuery({ name: 'status', required: false, example: 'open' })
    @ApiQuery({ name: 'assigneeId', required: false, example: 2 })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 20 })
    @ApiOkResponse({
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
        description: 'Validation error',
        schema: {
            example: {
                success: false,
                message: 'limit must not be greater than 100',
                code: 'BAD_REQUEST',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @Get()
    findAll(@Query() query: GetTicketsQueryDto) {
        return this.queryBus.execute(
            new GetTicketsQuery({
                page: query.page ?? 1,
                limit: query.limit ?? 20,
                status: query.status,
                assigneeId: query.assigneeId,
            }),
        );
    }

    /**
     * Returns detailed information of a single ticket.
     *
     * @param id Ticket identifier.
     * @returns Detailed ticket data.
     */
    @ApiOperation({
        summary: 'Get ticket details by id',
        description: 'Returns one detailed ticket, including relational data when available.',
    })
    @ApiParam({ name: 'id', example: 101, description: 'Ticket identifier' })
    @ApiOkResponse({
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
        description: 'Ticket not found',
        schema: {
            example: {
                success: false,
                message: 'Ticket não encontrado',
                code: 'NOT_FOUND',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Validation error',
        schema: {
            example: {
                success: false,
                message: 'Validation failed (numeric string is expected)',
                code: 'BAD_REQUEST',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.queryBus.execute(new GetTicketQuery({ ticketId: id }));
    }
}
