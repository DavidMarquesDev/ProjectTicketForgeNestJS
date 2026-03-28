import { Logger } from '@nestjs/common';
import { NotifyCommentCreatedHandler } from './notify-comment-created.handler';
import { CommentCreatedEvent } from './comment-created.event';

describe('NotifyCommentCreatedHandler', () => {
    it('deve registrar log estruturado ao receber evento', () => {
        const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
        const handler = new NotifyCommentCreatedHandler();

        handler.handle(new CommentCreatedEvent(20, 10, 3));

        expect(logSpy).toHaveBeenCalled();
        expect(logSpy.mock.calls[0]?.[0]).toContain('"action":"comment_notification_enqueued"');
        logSpy.mockRestore();
    });
});
