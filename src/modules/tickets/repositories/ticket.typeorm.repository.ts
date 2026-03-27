import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import {
    ITicketRepository,
    PaginatedTickets,
    TicketPaginationParams,
} from './ticket.repository.interface';

@Injectable()
export class TicketTypeOrmRepository implements ITicketRepository {
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

    async findByIdOrFail(ticketId: number): Promise<Ticket> {
        const ticket = await this.ormRepository.findOne({
            where: { id: ticketId },
            relations: { creator: true, assignee: true },
        });

        if (!ticket) {
            throw new NotFoundException('Ticket não encontrado');
        }

        return ticket;
    }

    async save(ticket: Ticket): Promise<Ticket> {
        return this.ormRepository.save(ticket);
    }

    async assign(ticketId: number, assigneeId: number): Promise<void> {
        await this.ormRepository.update({ id: ticketId }, { assignedTo: assigneeId });
    }

    async paginate(params: TicketPaginationParams): Promise<PaginatedTickets> {
        const queryBuilder = this.ormRepository
            .createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.creator', 'creator')
            .leftJoinAndSelect('ticket.assignee', 'assignee')
            .orderBy('ticket.createdAt', 'DESC');

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
            relations: { creator: true, assignee: true },
        });
    }
}
