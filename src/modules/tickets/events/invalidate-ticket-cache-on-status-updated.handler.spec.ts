import { TicketStatus } from '../entities/ticket-status.enum';
import { TicketReadCacheService } from '../services/ticket-read-cache.service';
import { InvalidateTicketCacheOnStatusUpdatedHandler } from './invalidate-ticket-cache-on-status-updated.handler';
import { TicketStatusUpdatedEvent } from './ticket-status-updated.event';

describe('InvalidateTicketCacheOnStatusUpdatedHandler', () => {
    it('deve invalidar cache do ticket ao atualizar status', async () => {
        const cacheService = {
            invalidate: jest.fn(),
        };
        const handler = new InvalidateTicketCacheOnStatusUpdatedHandler(
            cacheService as unknown as TicketReadCacheService,
        );

        await handler.handle(new TicketStatusUpdatedEvent(15, TicketStatus.IN_PROGRESS, 3));

        expect(cacheService.invalidate).toHaveBeenCalledWith(15);
    });
});

