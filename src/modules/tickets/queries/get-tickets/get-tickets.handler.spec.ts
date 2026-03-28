import { GetTicketsHandler } from './get-tickets.handler';
import { ITicketRepository } from '../../repositories/ticket.repository.interface';
import { TicketStatus } from '../../entities/ticket-status.enum';
import { GetTicketsQuery } from './get-tickets.query';

describe('GetTicketsHandler', () => {
    it('deve retornar paginação com sucesso', async () => {
        const repository: ITicketRepository = {
            createAndSave: jest.fn(),
            findByIdOrFail: jest.fn(),
            save: jest.fn(),
            assign: jest.fn(),
            findOneDetailed: jest.fn(),
            paginate: jest.fn().mockResolvedValue({
                data: [],
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 1,
            }),
        };
        const handler = new GetTicketsHandler(repository);

        const response = await handler.execute(
            new GetTicketsQuery({
                page: 1,
                limit: 20,
                status: TicketStatus.OPEN,
                assigneeId: undefined,
            }),
        );

        expect(response.success).toBe(true);
        expect(response.meta.totalPages).toBe(1);
        expect(repository.paginate).toHaveBeenCalledWith({
            page: 1,
            limit: 20,
            status: TicketStatus.OPEN,
            assigneeId: undefined,
        });
    });
});
