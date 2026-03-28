import { TicketReadCacheService } from '../../tickets/services/ticket-read-cache.service';
import { CommentCreatedEvent } from './comment-created.event';
import { InvalidateTicketCacheOnCommentCreatedHandler } from './invalidate-ticket-cache-on-comment-created.handler';

describe('InvalidateTicketCacheOnCommentCreatedHandler', () => {
    it('deve invalidar cache do ticket ao criar comentário', async () => {
        const cacheService = {
            invalidate: jest.fn(),
        };
        const handler = new InvalidateTicketCacheOnCommentCreatedHandler(
            cacheService as unknown as TicketReadCacheService,
        );

        await handler.handle(new CommentCreatedEvent(7, 21, 2));

        expect(cacheService.invalidate).toHaveBeenCalledWith(21);
    });
});

