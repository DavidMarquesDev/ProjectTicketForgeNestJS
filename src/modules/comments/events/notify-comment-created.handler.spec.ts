import { Logger } from '@nestjs/common';
import { NotifyCommentCreatedHandler } from './notify-comment-created.handler';
import { CommentCreatedEvent } from './comment-created.event';

describe('NotifyCommentCreatedHandler', () => {
    it('deve enfileirar solicitação de notificação via outbox e registrar log', async () => {
        const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
        const outboxService = {
            createPendingEvent: jest.fn(),
        };
        const handler = new NotifyCommentCreatedHandler(outboxService as never);

        await handler.handle(new CommentCreatedEvent(20, 10, 3));

        expect(outboxService.createPendingEvent).toHaveBeenCalledWith({
            eventName: 'CommentNotificationRequestedEvent',
            aggregateType: 'notification',
            aggregateId: '20',
            payload: {
                commentId: 20,
                ticketId: 10,
                authorId: 3,
            },
        });
        expect(logSpy).toHaveBeenCalled();
        expect(logSpy.mock.calls[0]?.[0]).toContain('"action":"comment_notification_enqueued"');
        logSpy.mockRestore();
    });
});
