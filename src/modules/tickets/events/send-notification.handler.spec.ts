import { Logger } from '@nestjs/common';
import { SendNotificationHandler } from './send-notification.handler';
import { TicketCreatedEvent } from './ticket-created.event';

describe('SendNotificationHandler', () => {
    it('deve registrar log estruturado ao receber evento', () => {
        const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
        const handler = new SendNotificationHandler();

        handler.handle(new TicketCreatedEvent(10, 2));

        expect(logSpy).toHaveBeenCalled();
        expect(logSpy.mock.calls[0]?.[0]).toContain('"action":"ticket_notification_enqueued"');
        logSpy.mockRestore();
    });
});
