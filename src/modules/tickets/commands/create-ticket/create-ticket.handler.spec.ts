import { EventBus } from '@nestjs/cqrs';
import { CreateTicketHandler } from './create-ticket.handler';
import { CreateTicketCommand } from './create-ticket.command';
import { ITicketRepository } from '../../repositories/ticket.repository.interface';
import { TicketStatus } from '../../entities/ticket-status.enum';

describe('CreateTicketHandler', () => {
    it('deve criar ticket e publicar evento', async () => {
        const repository: ITicketRepository = {
            createAndSave: jest.fn().mockResolvedValue({
                id: 1,
                title: 'Título',
                description: 'Descrição detalhada',
                createdBy: 1,
                creator: null,
                assignedTo: null,
                assignee: null,
                status: TicketStatus.OPEN,
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
            findById: jest.fn(),
            save: jest.fn(),
            assign: jest.fn(),
            paginate: jest.fn(),
            findOneDetailed: jest.fn(),
        };
        const eventBus = {
            publish: jest.fn(),
        } as unknown as EventBus;
        const outboxService = {
            createPendingEvent: jest.fn(),
        };
        const handler = new CreateTicketHandler(repository, eventBus, outboxService as never);

        const result = await handler.execute(
            new CreateTicketCommand(
                {
                    title: 'Título',
                    description: 'Descrição detalhada',
                },
                1,
            ),
        );

        expect(result).toEqual({ id: 1, success: true });
        expect(repository.createAndSave).toHaveBeenCalled();
        expect(eventBus.publish).toHaveBeenCalled();
        expect(outboxService.createPendingEvent).toHaveBeenCalled();
    });
});
