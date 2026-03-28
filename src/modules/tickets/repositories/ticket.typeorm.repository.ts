import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import {
    ITicketRepository,
    PaginatedTickets,
    TicketPaginationParams,
    TicketSortBy,
    TicketSortOrder,
} from './ticket.repository.interface';

@Injectable()
export class TicketTypeOrmRepository implements ITicketRepository {
    private readonly detailedRelations = { creator: true, assignee: true } as const;

    constructor(
        @InjectRepository(Ticket)
        private readonly ormRepository: Repository<Ticket>,
    ) {}

    async createAndSave(input: { title: string; description: string; createdBy: number }): Promise<Ticket> {
        const ticket = this.ormRepository.create({
            title: input.title,
            description: input.description,
            createdBy: input.createdBy,
        });
        return this.ormRepository.save(ticket);
    }

    async findById(ticketId: number): Promise<Ticket | null> {
        return this.ormRepository.findOne({
            where: { id: ticketId },
        });
    }

    async save(ticket: Ticket): Promise<Ticket> {
        return this.ormRepository.save(ticket);
    }

    async assign(ticketId: number, assigneeId: number): Promise<void> {
        await this.ormRepository.update({ id: ticketId }, { assignedTo: assigneeId });
    }

    async paginate(params: TicketPaginationParams): Promise<PaginatedTickets> {
        const sortColumnByField: Record<TicketSortBy, string> = {
            [TicketSortBy.CREATED_AT]: 'ticket.createdAt',
            [TicketSortBy.UPDATED_AT]: 'ticket.updatedAt',
            [TicketSortBy.STATUS]: 'ticket.status',
        };
        const sortField = params.sortBy ?? TicketSortBy.CREATED_AT;
        const sortOrder = params.order ?? TicketSortOrder.DESC;
        const queryBuilder = this.ormRepository
            .createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.creator', 'creator')
            .leftJoinAndSelect('ticket.assignee', 'assignee')
            .orderBy(sortColumnByField[sortField], sortOrder);

        if (params.status) {
            queryBuilder.andWhere('ticket.status = :status', { status: params.status });
        }

        if (params.assigneeId) {
            queryBuilder.andWhere('ticket.assignedTo = :assigneeId', { assigneeId: params.assigneeId });
        }

        const skip = (params.page - 1) * params.limit;
        queryBuilder.skip(skip).take(params.limit);

        const [data, total] = await queryBuilder.getManyAndCount();
        const totalPages = Math.ceil(total / params.limit) || 1;

        return {
            data,
            total,
            page: params.page,
            limit: params.limit,
            totalPages,
        };
    }

    async findOneDetailed(ticketId: number): Promise<Ticket | null> {
        return this.ormRepository.findOne({
            where: { id: ticketId },
            relations: this.detailedRelations,
        });
    }
}
