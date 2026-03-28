import { EventBus } from '@nestjs/cqrs';
import { UserRole } from '../../../auth/entities/user.entity';
import { TicketStatus } from '../../entities/ticket-status.enum';
import { UpdateStatusCommand } from './update-status.command';
import { UpdateStatusHandler } from './update-status.handler';

describe('UpdateStatusHandler', () => {
    it('deve atualizar status e publicar evento', async () => {
        const ticket = {
            id: 1,
            status: TicketStatus.OPEN,
            createdBy: 10,
            assignedTo: null,
        };
        const ticketRepository = {
            findById: jest.fn().mockResolvedValue(ticket),
            save: jest.fn().mockResolvedValue({ ...ticket, status: TicketStatus.IN_PROGRESS }),
        };
        const policyService = {
            assertCanUpdateStatus: jest.fn(),
        };
        const statusTransitionService = {
            assertValidTransition: jest.fn(),
        };
        const eventBus = {
            publish: jest.fn(),
        } as unknown as EventBus;
        const outboxService = {
            createPendingEvent: jest.fn(),
        };
        const auditTrailService = {
            record: jest.fn(),
        };
        const handler = new UpdateStatusHandler(
            ticketRepository as never,
            policyService as never,
            statusTransitionService as never,
            eventBus,
            outboxService as never,
            auditTrailService as never,
        );

        const result = await handler.execute(
            new UpdateStatusCommand(
                1,
                {
                    status: TicketStatus.IN_PROGRESS,
                },
                10,
                UserRole.SUPPORT,
            ),
        );

        expect(result).toEqual({ id: 1, success: true });
        expect(ticketRepository.save).toHaveBeenCalled();
        expect(eventBus.publish).toHaveBeenCalled();
        expect(outboxService.createPendingEvent).toHaveBeenCalled();
        expect(auditTrailService.record).toHaveBeenCalledTimes(1);
    });
});
