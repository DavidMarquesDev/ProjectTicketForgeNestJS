import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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

    @Post()
    create(@Body() dto: CreateTicketDto, @CurrentUser() user: AuthenticatedUser) {
        return this.commandBus.execute(new CreateTicketCommand(dto.title, dto.description, user.id));
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateStatusDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.commandBus.execute(new UpdateStatusCommand(id, dto.status, user.id, user.role));
    }

    @Patch(':id/assign')
    assign(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AssignTicketDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.commandBus.execute(new AssignTicketCommand(id, dto.userId, user.role));
    }

    @Get()
    findAll(@Query() query: GetTicketsQueryDto) {
        return this.queryBus.execute(
            new GetTicketsQuery(query.page ?? 1, query.limit ?? 20, query.status, query.assigneeId),
        );
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.queryBus.execute(new GetTicketQuery(id));
    }
}
