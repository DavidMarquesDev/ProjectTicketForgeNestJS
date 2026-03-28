import { Logger } from '@nestjs/common';
import { SendNotificationHandler } from './send-notification.handler';
import { TicketCreatedEvent } from '../contracts';

describe('SendNotificationHandler', () => {
    it('deve enfileirar solicitação de notificação via outbox e registrar log', async () => {
        const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
        const outboxService = {
            createPendingEvent: jest.fn(),
        };
        const handler = new SendNotificationHandler(outboxService as never);

        await handler.handle(new TicketCreatedEvent(10, 2));

        expect(outboxService.createPendingEvent).toHaveBeenCalledWith({
            eventName: 'TicketNotificationRequestedEvent',
            aggregateType: 'notification',
            aggregateId: '10',
            payload: {
                ticketId: 10,
                createdBy: 2,
            },
        });
        expect(logSpy).toHaveBeenCalled();
        expect(logSpy.mock.calls[0]?.[0]).toContain('"action":"ticket_notification_enqueued"');
        logSpy.mockRestore();
    });
});
