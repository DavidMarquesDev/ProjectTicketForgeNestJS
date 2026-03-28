import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThanOrEqual, Not, Repository } from 'typeorm';
import { TraceContextStore } from '../../common/observability/trace-context.store';
import { OutboxEvent } from './entities/outbox-event.entity';
import { OutboxEventStatus } from './entities/outbox-event-status.enum';

type CreateOutboxEventInput = {
    eventId?: string;
    eventName: string;
    schemaVersion?: number;
    aggregateType: string;
    aggregateId: string;
    traceId?: string | null;
    payload: Record<string, unknown>;
};

export enum DeadLetterSortBy {
    CREATED_AT = 'createdAt',
    DEAD_LETTERED_AT = 'deadLetteredAt',
    ATTEMPTS = 'attempts',
}

export enum DeadLetterSortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export type DeadLetterPaginationParams = {
    page: number;
    limit: number;
    eventName?: string;
    aggregateType?: string;
    from?: Date;
    to?: Date;
    attemptsMin?: number;
    attemptsMax?: number;
    sortBy?: DeadLetterSortBy;
    order?: DeadLetterSortOrder;
};

export type PaginatedDeadLetterEvents = {
    data: OutboxEvent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type MarkFailedResult = {
    marked: boolean;
    status: OutboxEventStatus.FAILED | OutboxEventStatus.DEAD_LETTERED;
    attempts: number;
};

export type PendingTimeStats = {
    averagePendingSeconds: number;
    oldestPendingSeconds: number;
    samples: number;
};

@Injectable()
export class OutboxService {
    private readonly maxAttempts = Number(process.env.OUTBOX_MAX_ATTEMPTS ?? 5);

    constructor(
        @InjectRepository(OutboxEvent)
        private readonly outboxRepository: Repository<OutboxEvent>,
    ) {}

    async createPendingEvent(input: CreateOutboxEventInput, manager?: EntityManager): Promise<OutboxEvent> {
        const repository = this.resolveRepository(manager);
        const event = repository.create({
            eventId: input.eventId ?? randomUUID(),
            eventName: input.eventName,
            schemaVersion: input.schemaVersion ?? 1,
            aggregateType: input.aggregateType,
            aggregateId: input.aggregateId,
            traceId: input.traceId ?? TraceContextStore.getTraceId() ?? null,
            payload: JSON.stringify(input.payload),
            status: OutboxEventStatus.PENDING,
            attempts: 0,
            availableAt: new Date(),
            queuedAt: null,
            processedAt: null,
            deadLetteredAt: null,
            lastError: null,
        });

        return repository.save(event);
    }

    async findDispatchable(limit: number): Promise<OutboxEvent[]> {
        return this.outboxRepository.find({
            where: [
                {
                    status: OutboxEventStatus.PENDING,
                    availableAt: LessThanOrEqual(new Date()),
                },
                {
                    status: OutboxEventStatus.FAILED,
                    availableAt: LessThanOrEqual(new Date()),
                },
            ],
            order: {
                createdAt: 'ASC',
            },
            take: limit,
        });
    }

    async paginateDeadLettered(params: DeadLetterPaginationParams): Promise<PaginatedDeadLetterEvents> {
        const sortColumnByField: Record<DeadLetterSortBy, string> = {
            [DeadLetterSortBy.CREATED_AT]: 'outbox.created_at',
            [DeadLetterSortBy.DEAD_LETTERED_AT]: 'outbox.dead_lettered_at',
            [DeadLetterSortBy.ATTEMPTS]: 'outbox.attempts',
        };
        const sortField = params.sortBy ?? DeadLetterSortBy.DEAD_LETTERED_AT;
        const sortOrder = params.order ?? DeadLetterSortOrder.DESC;
        const queryBuilder = this.outboxRepository
            .createQueryBuilder('outbox')
            .select([
                'outbox.id',
                'outbox.eventId',
                'outbox.eventName',
                'outbox.schemaVersion',
                'outbox.aggregateType',
                'outbox.aggregateId',
                'outbox.traceId',
                'outbox.status',
                'outbox.attempts',
                'outbox.availableAt',
                'outbox.queuedAt',
                'outbox.processedAt',
                'outbox.deadLetteredAt',
                'outbox.lastError',
                'outbox.createdAt',
                'outbox.updatedAt',
            ])
            .where('outbox.status = :status', { status: OutboxEventStatus.DEAD_LETTERED })
            .orderBy(sortColumnByField[sortField], sortOrder);

        if (params.eventName) {
            queryBuilder.andWhere('outbox.event_name = :eventName', { eventName: params.eventName });
        }

        if (params.aggregateType) {
            queryBuilder.andWhere('outbox.aggregate_type = :aggregateType', {
                aggregateType: params.aggregateType,
            });
        }

        if (params.from) {
            queryBuilder.andWhere('outbox.dead_lettered_at >= :from', { from: params.from });
        }

        if (params.to) {
            queryBuilder.andWhere('outbox.dead_lettered_at <= :to', { to: params.to });
        }

        if (params.attemptsMin !== undefined) {
            queryBuilder.andWhere('outbox.attempts >= :attemptsMin', {
                attemptsMin: params.attemptsMin,
            });
        }

        if (params.attemptsMax !== undefined) {
            queryBuilder.andWhere('outbox.attempts <= :attemptsMax', {
                attemptsMax: params.attemptsMax,
            });
        }

        const skip = (params.page - 1) * params.limit;
        queryBuilder.skip(skip).take(params.limit);

        const [data, total] = await queryBuilder.getManyAndCount();
        const totalPages = Math.ceil(total / params.limit) || 1;

        return {
            data,
            total,
            page: params.page,
            limit: params.limit,
            totalPages,
        };
    }

    async findById(eventId: string): Promise<OutboxEvent | null> {
        return this.outboxRepository.findOne({
            where: {
                id: eventId,
            },
        });
    }

    async markQueued(eventId: string): Promise<void> {
        await this.outboxRepository.update(
            { id: eventId },
            {
                status: OutboxEventStatus.QUEUED,
                queuedAt: new Date(),
                updatedAt: new Date(),
            },
        );
    }

    async prepareDeadLetterForReprocess(eventId: string): Promise<void> {
        await this.outboxRepository.update(
            { id: eventId },
            {
                status: OutboxEventStatus.QUEUED,
                attempts: 0,
                availableAt: new Date(),
                queuedAt: new Date(),
                processedAt: null,
                deadLetteredAt: null,
                lastError: null,
                updatedAt: new Date(),
            },
        );
    }

    async markProcessed(eventId: string): Promise<void> {
        await this.outboxRepository.update(
            { id: eventId },
            {
                status: OutboxEventStatus.PROCESSED,
                processedAt: new Date(),
                updatedAt: new Date(),
            },
        );
    }

    async markFailed(eventId: string, errorMessage: string): Promise<MarkFailedResult> {
        const currentEvent = await this.outboxRepository.findOne({ where: { id: eventId } });
        if (!currentEvent) {
            return {
                marked: false,
                status: OutboxEventStatus.FAILED,
                attempts: 0,
            };
        }

        const attempts = currentEvent.attempts + 1;
        const normalizedMaxAttempts = Number.isInteger(this.maxAttempts) && this.maxAttempts > 0
            ? this.maxAttempts
            : 5;
        const shouldMoveToDeadLetter = attempts >= normalizedMaxAttempts;
        const exponentialDelaySeconds = Math.min(15 * 2 ** Math.max(attempts - 1, 0), 300);
        const jitterSeconds = this.generateJitterSeconds(exponentialDelaySeconds);
        const retryDelaySeconds = Math.min(exponentialDelaySeconds + jitterSeconds, 300);
        const availableAt = new Date(Date.now() + retryDelaySeconds * 1000);
        const status = shouldMoveToDeadLetter ? OutboxEventStatus.DEAD_LETTERED : OutboxEventStatus.FAILED;

        await this.outboxRepository.update(
            { id: eventId },
            {
                status,
                attempts,
                availableAt: shouldMoveToDeadLetter ? new Date() : availableAt,
                deadLetteredAt: shouldMoveToDeadLetter ? new Date() : null,
                lastError: errorMessage,
                updatedAt: new Date(),
            },
        );

        return {
            marked: true,
            status,
            attempts,
        };
    }

    async hasProcessedEventWithEventId(eventId: string, outboxEventId: string): Promise<boolean> {
        return this.outboxRepository.exists({
            where: {
                eventId,
                status: OutboxEventStatus.PROCESSED,
                id: Not(outboxEventId),
            },
        });
    }

    async countByStatus(status: OutboxEventStatus): Promise<number> {
        return this.outboxRepository.count({
            where: {
                status,
            },
        });
    }

    async countByStatuses(statuses: OutboxEventStatus[]): Promise<number> {
        if (statuses.length === 0) {
            return 0;
        }

        return this.outboxRepository
            .createQueryBuilder('outbox')
            .where('outbox.status IN (:...statuses)', { statuses })
            .getCount();
    }

    async getPendingTimeStats(
        statuses: OutboxEventStatus[] = [
            OutboxEventStatus.PENDING,
            OutboxEventStatus.FAILED,
            OutboxEventStatus.QUEUED,
        ],
    ): Promise<PendingTimeStats> {
        if (statuses.length === 0) {
            return {
                averagePendingSeconds: 0,
                oldestPendingSeconds: 0,
                samples: 0,
            };
        }

        const rawDates = await this.outboxRepository
            .createQueryBuilder('outbox')
            .select('outbox.createdAt', 'createdAt')
            .where('outbox.status IN (:...statuses)', { statuses })
            .getRawMany<{ createdAt: Date | string }>();
        if (rawDates.length === 0) {
            return {
                averagePendingSeconds: 0,
                oldestPendingSeconds: 0,
                samples: 0,
            };
        }

        const nowMs = Date.now();
        const pendingSeconds = rawDates
            .map((raw) => new Date(raw.createdAt).getTime())
            .filter((value) => Number.isFinite(value))
            .map((createdAtMs) => Math.max(0, (nowMs - createdAtMs) / 1000));
        if (pendingSeconds.length === 0) {
            return {
                averagePendingSeconds: 0,
                oldestPendingSeconds: 0,
                samples: 0,
            };
        }

        const total = pendingSeconds.reduce((sum, value) => sum + value, 0);
        const oldestPendingSeconds = Math.max(...pendingSeconds);
        return {
            averagePendingSeconds: Number((total / pendingSeconds.length).toFixed(2)),
            oldestPendingSeconds: Number(oldestPendingSeconds.toFixed(2)),
            samples: pendingSeconds.length,
        };
    }

    private resolveRepository(manager?: EntityManager): Repository<OutboxEvent> {
        if (manager) {
            return manager.getRepository(OutboxEvent);
        }

        return this.outboxRepository;
    }

    private generateJitterSeconds(baseDelaySeconds: number): number {
        if (baseDelaySeconds <= 0) {
            return 0;
        }

        const maxJitterSeconds = Math.max(1, Math.floor(baseDelaySeconds * 0.2));
        return Math.floor(Math.random() * (maxJitterSeconds + 1));
    }
}
