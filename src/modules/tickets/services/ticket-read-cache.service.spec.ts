import { TicketReadCacheService } from './ticket-read-cache.service';

describe('TicketReadCacheService', () => {
    it('deve armazenar e recuperar ticket', () => {
        const service = new TicketReadCacheService();

        service.set(10, {
            success: true,
            data: {
                id: 10,
                title: 'Título',
            } as never,
        });

        const cached = service.get(10);

        expect(cached).not.toBeNull();
        expect(cached?.data.id).toBe(10);
    });

    it('deve invalidar ticket do cache', () => {
        const service = new TicketReadCacheService();

        service.set(8, {
            success: true,
            data: {
                id: 8,
                title: 'Título',
            } as never,
        });

        service.invalidate(8);

        expect(service.get(8)).toBeNull();
    });
});

