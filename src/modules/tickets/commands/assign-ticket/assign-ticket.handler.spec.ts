import { UserRole } from '../../../auth/entities/user.entity';
import { AssignTicketCommand } from './assign-ticket.command';
import { AssignTicketHandler } from './assign-ticket.handler';

describe('AssignTicketHandler', () => {
    it('deve atribuir ticket com sucesso', async () => {
        const ticketRepository = {
            findByIdOrFail: jest.fn().mockResolvedValue({ id: 1 }),
            assign: jest.fn().mockResolvedValue(undefined),
        };
        const policyService = {
            assertCanAssign: jest.fn(),
        };
        const handler = new AssignTicketHandler(ticketRepository as never, policyService as never);

        const result = await handler.execute(
            new AssignTicketCommand(
                1,
                {
                    userId: 2,
                },
                UserRole.SUPPORT,
            ),
        );

        expect(result).toEqual({ id: 1, success: true });
        expect(policyService.assertCanAssign).toHaveBeenCalledWith(UserRole.SUPPORT);
        expect(ticketRepository.assign).toHaveBeenCalledWith(1, 2);
    });
});
