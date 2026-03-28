import { Logger } from '@nestjs/common';
import { WebhookNotificationDispatcher } from './webhook-notification.dispatcher';

describe('WebhookNotificationDispatcher', () => {
    it('deve ignorar envio quando webhook não estiver configurado', async () => {
        const previousWebhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
        delete process.env.NOTIFICATION_WEBHOOK_URL;
        const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

        const dispatcher = new WebhookNotificationDispatcher();

        await dispatcher.dispatch({
            eventName: 'TicketNotificationRequestedEvent',
            aggregateId: '10',
            payload: { ticketId: 10 },
        });

        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
        if (previousWebhookUrl === undefined) {
            delete process.env.NOTIFICATION_WEBHOOK_URL;
        } else {
            process.env.NOTIFICATION_WEBHOOK_URL = previousWebhookUrl;
        }
    });
});
