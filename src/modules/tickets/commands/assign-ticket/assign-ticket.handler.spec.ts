import { EventBus } from '@nestjs/cqrs';
import { UserRole } from '../../../auth/entities/user.entity';
import { AssignTicketCommand } from './assign-ticket.command';
import { AssignTicketHandler } from './assign-ticket.handler';

describe('AssignTicketHandler', () => {
    it('deve atribuir ticket com sucesso', async () => {
        const ticketRepository = {
            findById: jest.fn().mockResolvedValue({ id: 1 }),
            assign: jest.fn().mockResolvedValue(undefined),
        };
        const policyService = {
            assertCanAssign: jest.fn(),
        };
        const eventBus = {
            publish: jest.fn(),
        } as unknown as EventBus;
        const handler = new AssignTicketHandler(
            ticketRepository as never,
            policyService as never,
            eventBus,
        );

        const result = await handler.execute(
            new AssignTicketCommand(
                1,
                {
                    userId: 2,
                },
                UserRole.SUPPORT,
                3,
            ),
        );

        expect(result).toEqual({ id: 1, success: true });
        expect(policyService.assertCanAssign).toHaveBeenCalledWith(UserRole.SUPPORT);
        expect(ticketRepository.assign).toHaveBeenCalledWith(1, 2);
        expect(eventBus.publish).toHaveBeenCalledTimes(1);
    });
});
