import { NotFoundException } from '@nestjs/common';
import { TicketStatus } from '../../entities/ticket-status.enum';
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
        const handler = new GetTicketHandler(ticketRepository as never);

        const result = await handler.execute(new GetTicketQuery({ ticketId: 1 }));

        expect(result.success).toBe(true);
        expect(result.data.id).toBe(1);
    });

    it('deve consultar o repositório para retornar o ticket', async () => {
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
        const handler = new GetTicketHandler(ticketRepository as never);

        const result = await handler.execute(new GetTicketQuery({ ticketId: 1 }));

        expect(result.success).toBe(true);
        expect(result.data.id).toBe(1);
        expect(ticketRepository.findOneDetailed).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro quando ticket não existir', async () => {
        const ticketRepository = {
            findOneDetailed: jest.fn().mockResolvedValue(null),
        };
        const handler = new GetTicketHandler(ticketRepository as never);

        await expect(handler.execute(new GetTicketQuery({ ticketId: 999 }))).rejects.toThrow(
            NotFoundException,
        );
    });
});
