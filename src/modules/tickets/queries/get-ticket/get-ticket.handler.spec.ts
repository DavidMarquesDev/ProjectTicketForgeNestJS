import { NotFoundException } from '@nestjs/common';
import { TicketStatus } from '../../entities/ticket-status.enum';
import { TicketReadCacheService } from '../../services/ticket-read-cache.service';
import { GetTicketQuery } from './get-ticket.query';
import { GetTicketHandler } from './get-ticket.handler';

describe('GetTicketHandler', () => {
    it('deve retornar ticket detalhado', async () => {
        const ticketRepository = {
            findOneDetailed: jest.fn().mockResolvedValue({
                id: 1,
                title: 'Ticket',
                description: 'Descrição detalhada',
                status: TicketStatus.OPEN,
                createdBy: 1,
                assignedTo: null,
                creator: null,
                assignee: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
        };
        const cacheService = {
            get: jest.fn().mockReturnValue(null),
            set: jest.fn(),
        };
        const handler = new GetTicketHandler(
            ticketRepository as never,
            cacheService as unknown as TicketReadCacheService,
        );

        const result = await handler.execute(new GetTicketQuery({ ticketId: 1 }));

        expect(result.success).toBe(true);
        expect(result.data.id).toBe(1);
        expect(cacheService.set).toHaveBeenCalledTimes(1);
    });

    it('deve retornar ticket em cache sem consultar o repositório', async () => {
        const ticketRepository = {
            findOneDetailed: jest.fn(),
        };
        const cacheService = {
            get: jest.fn().mockReturnValue({
                success: true as const,
                data: {
                    id: 1,
                    title: 'Ticket em cache',
                },
            }),
            set: jest.fn(),
        };
        const handler = new GetTicketHandler(
            ticketRepository as never,
            cacheService as unknown as TicketReadCacheService,
        );

        const result = await handler.execute(new GetTicketQuery({ ticketId: 1 }));

        expect(result.success).toBe(true);
        expect(result.data.id).toBe(1);
        expect(ticketRepository.findOneDetailed).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando ticket não existir', async () => {
        const ticketRepository = {
            findOneDetailed: jest.fn().mockResolvedValue(null),
        };
        const cacheService = {
            get: jest.fn().mockReturnValue(null),
            set: jest.fn(),
        };
        const handler = new GetTicketHandler(
            ticketRepository as never,
            cacheService as unknown as TicketReadCacheService,
        );

        await expect(handler.execute(new GetTicketQuery({ ticketId: 999 }))).rejects.toThrow(
            NotFoundException,
        );
    });
});
