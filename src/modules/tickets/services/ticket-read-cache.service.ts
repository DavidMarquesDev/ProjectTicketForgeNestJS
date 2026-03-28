import { Injectable } from '@nestjs/common';
import { Ticket } from '../entities/ticket.entity';

type CachedTicketDetail = {
    success: true;
    data: Ticket;
};

type CacheEntry = {
    value: CachedTicketDetail;
    expiresAt: number;
};

@Injectable()
export class TicketReadCacheService {
    private readonly cache = new Map<string, CacheEntry>();
    private readonly defaultTtlSeconds = Number(process.env.TICKET_DETAIL_CACHE_TTL_SECONDS ?? 30);

    get(ticketId: number): CachedTicketDetail | null {
        const key = this.getDetailKey(ticketId);
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }

        if (entry.expiresAt <= Date.now()) {
            this.cache.delete(key);
            return null;
        }

        return this.cloneCachedTicket(entry.value);
    }

    set(ticketId: number, value: CachedTicketDetail): void {
        const key = this.getDetailKey(ticketId);
        const ttlSeconds = this.defaultTtlSeconds > 0 ? this.defaultTtlSeconds : 30;
        const expiresAt = Date.now() + ttlSeconds * 1000;
        this.cache.set(key, {
            value: this.cloneCachedTicket(value),
            expiresAt,
        });
    }

    invalidate(ticketId: number): void {
        this.cache.delete(this.getDetailKey(ticketId));
    }

    private getDetailKey(ticketId: number): string {
        return `tickets:detail:${ticketId}`;
    }

    private cloneCachedTicket(value: CachedTicketDetail): CachedTicketDetail {
        return structuredClone(value);
    }
}

