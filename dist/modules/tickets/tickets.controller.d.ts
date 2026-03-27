import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { GetTicketsQueryDto } from './dto/get-tickets-query.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
export declare class TicketsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateTicketDto, user: AuthenticatedUser): Promise<any>;
    updateStatus(id: number, dto: UpdateStatusDto, user: AuthenticatedUser): Promise<any>;
    assign(id: number, dto: AssignTicketDto, user: AuthenticatedUser): Promise<any>;
    findAll(query: GetTicketsQueryDto): Promise<any>;
    findOne(id: number): Promise<any>;
}
