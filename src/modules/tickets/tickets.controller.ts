import { Body, Controller, Get, Headers, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
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
import {
    assignTicketApiBadRequestResponse,
    assignTicketApiBody,
    assignTicketApiForbiddenResponse,
    assignTicketApiOkResponse,
    assignTicketApiOperation,
    createTicketApiBadRequestResponse,
    createTicketApiBody,
    createTicketApiCreatedResponse,
    createTicketApiOperation,
    getTicketApiBadRequestResponse,
    getTicketApiOkResponse,
    getTicketApiOperation,
    listTicketsApiBadRequestResponse,
    listTicketsApiOkResponse,
    listTicketsApiOperation,
    ticketApiNotFoundResponse,
    ticketApiUnauthorizedResponse,
    updateStatusApiBadRequestResponse,
    updateStatusApiBody,
    updateStatusApiForbiddenResponse,
    updateStatusApiOkResponse,
    updateStatusApiOperation,
    updateStatusApiParam,
} from './api/tickets.http-documentation';
import { AssignTicketCommand } from './commands/assign-ticket/assign-ticket.command';
import { CreateTicketCommand } from './commands/create-ticket/create-ticket.command';
import { UpdateStatusCommand } from './commands/update-status/update-status.command';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { GetTicketsQueryDto } from './dto/get-tickets-query.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { IdempotencyService } from '../idempotency/idempotency.service';
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
        private readonly idempotencyService: IdempotencyService,
    ) {}

    /**
     * Creates a new ticket owned by the authenticated user.
     *
     * @param dto Ticket creation payload.
     * @param user Authenticated user extracted from JWT.
     * @returns Created ticket identifier.
     */
    @ApiOperation(createTicketApiOperation)
    @ApiBody(createTicketApiBody)
    @ApiCreatedResponse(createTicketApiCreatedResponse)
    @ApiUnauthorizedResponse(ticketApiUnauthorizedResponse)
    @ApiBadRequestResponse(createTicketApiBadRequestResponse)
    @Post()
    create(
        @Body() dto: CreateTicketDto,
        @CurrentUser() user: AuthenticatedUser,
        @Headers('idempotency-key') idempotencyKey?: string,
    ) {
        return this.idempotencyService.execute({
            scope: 'tickets:create',
            actorId: user.id,
            key: idempotencyKey,
            action: () => this.commandBus.execute(new CreateTicketCommand(dto, user.id)),
        });
    }

    /**
     * Updates the status of a ticket when transition and authorization are valid.
     *
     * @param id Ticket identifier.
     * @param dto Status transition payload.
     * @param user Authenticated user extracted from JWT.
     * @returns Updated ticket identifier.
     */
    @ApiOperation(updateStatusApiOperation)
    @ApiParam(updateStatusApiParam)
    @ApiBody(updateStatusApiBody)
    @ApiOkResponse(updateStatusApiOkResponse)
    @ApiUnauthorizedResponse(ticketApiUnauthorizedResponse)
    @ApiForbiddenResponse(updateStatusApiForbiddenResponse)
    @ApiNotFoundResponse(ticketApiNotFoundResponse)
    @ApiBadRequestResponse(updateStatusApiBadRequestResponse)
    @Patch(':id/status')
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateStatusDto,
        @CurrentUser() user: AuthenticatedUser,
        @Headers('idempotency-key') idempotencyKey?: string,
    ) {
        return this.idempotencyService.execute({
            scope: `tickets:update-status:${id}`,
            actorId: user.id,
            key: idempotencyKey,
            action: () => this.commandBus.execute(new UpdateStatusCommand(id, dto, user.id, user.role)),
        });
    }

    /**
     * Assigns a ticket to a user when the actor has permission.
     *
     * @param id Ticket identifier.
     * @param dto Assignment payload.
     * @param user Authenticated user extracted from JWT.
     * @returns Updated ticket identifier.
     */
    @ApiOperation(assignTicketApiOperation)
    @ApiParam(updateStatusApiParam)
    @ApiBody(assignTicketApiBody)
    @ApiOkResponse(assignTicketApiOkResponse)
    @ApiUnauthorizedResponse(ticketApiUnauthorizedResponse)
    @ApiForbiddenResponse(assignTicketApiForbiddenResponse)
    @ApiNotFoundResponse(ticketApiNotFoundResponse)
    @ApiBadRequestResponse(assignTicketApiBadRequestResponse)
    @Patch(':id/assign')
    assign(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AssignTicketDto,
        @CurrentUser() user: AuthenticatedUser,
        @Headers('idempotency-key') idempotencyKey?: string,
    ) {
        return this.idempotencyService.execute({
            scope: `tickets:assign:${id}`,
            actorId: user.id,
            key: idempotencyKey,
            action: () => this.commandBus.execute(new AssignTicketCommand(id, dto, user.role)),
        });
    }

    /**
     * Returns a paginated list of tickets.
     *
     * @param query Ticket filters and pagination params.
     * @returns Paginated list of tickets.
     */
    @ApiOperation(listTicketsApiOperation)
    @ApiQuery({ name: 'status', required: false, example: 'open' })
    @ApiQuery({ name: 'assigneeId', required: false, example: 2 })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 20 })
    @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
    @ApiQuery({ name: 'order', required: false, example: 'DESC' })
    @ApiOkResponse(listTicketsApiOkResponse)
    @ApiUnauthorizedResponse(ticketApiUnauthorizedResponse)
    @ApiBadRequestResponse(listTicketsApiBadRequestResponse)
    @Get()
    findAll(@Query() query: GetTicketsQueryDto) {
        return this.queryBus.execute(
            new GetTicketsQuery({
                page: query.page ?? 1,
                limit: query.limit ?? 20,
                status: query.status,
                assigneeId: query.assigneeId,
                sortBy: query.sortBy,
                order: query.order,
            }),
        );
    }

    /**
     * Returns detailed information of a single ticket.
     *
     * @param id Ticket identifier.
     * @returns Detailed ticket data.
     */
    @ApiOperation(getTicketApiOperation)
    @ApiParam(updateStatusApiParam)
    @ApiOkResponse(getTicketApiOkResponse)
    @ApiUnauthorizedResponse(ticketApiUnauthorizedResponse)
    @ApiNotFoundResponse(ticketApiNotFoundResponse)
    @ApiBadRequestResponse(getTicketApiBadRequestResponse)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.queryBus.execute(new GetTicketQuery({ ticketId: id }));
    }
}
