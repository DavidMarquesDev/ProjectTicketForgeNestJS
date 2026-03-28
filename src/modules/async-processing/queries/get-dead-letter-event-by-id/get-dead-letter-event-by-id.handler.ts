import { ConflictException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { OutboxEventStatus } from '../../../outbox/entities/outbox-event-status.enum';
import { OutboxService } from '../../../outbox/outbox.service';
import { GetDeadLetterEventByIdQuery } from './get-dead-letter-event-by-id.query';

type GetDeadLetterEventByIdResult = {
    success: true;
    data: {
        id: string;
        eventId: string;
        eventName: string;
        schemaVersion: number;
        aggregateType: string;
        aggregateId: string;
        status: OutboxEventStatus.DEAD_LETTERED;
        attempts: number;
        availableAt: Date;
        queuedAt: Date | null;
        processedAt: Date | null;
        deadLetteredAt: Date | null;
        lastError: string | null;
        createdAt: Date;
        updatedAt: Date;
        payloadMasked: unknown;
    };
};

@QueryHandler(GetDeadLetterEventByIdQuery)
export class GetDeadLetterEventByIdHandler implements IQueryHandler<GetDeadLetterEventByIdQuery> {
    private readonly sensitiveKeys = [
        'password',
        'passwordhash',
        'token',
        'secret',
        'apikey',
        'api_key',
        'authorization',
        'cpf',
        'email',
    ];

    async execute(query: GetDeadLetterEventByIdQuery): Promise<GetDeadLetterEventByIdResult> {
        const outboxEvent = await this.outboxService.findById(query.outboxEventId);
        if (!outboxEvent) {
            throw new NotFoundException('Evento de outbox não encontrado');
        }

        if (outboxEvent.status !== OutboxEventStatus.DEAD_LETTERED) {
            throw new ConflictException('O evento informado não está em dead letter');
        }

        return {
            success: true,
            data: {
                id: outboxEvent.id,
                eventId: outboxEvent.eventId,
                eventName: outboxEvent.eventName,
                schemaVersion: outboxEvent.schemaVersion,
                aggregateType: outboxEvent.aggregateType,
                aggregateId: outboxEvent.aggregateId,
                status: OutboxEventStatus.DEAD_LETTERED,
                attempts: outboxEvent.attempts,
                availableAt: outboxEvent.availableAt,
                queuedAt: outboxEvent.queuedAt,
                processedAt: outboxEvent.processedAt,
                deadLetteredAt: outboxEvent.deadLetteredAt,
                lastError: outboxEvent.lastError,
                createdAt: outboxEvent.createdAt,
                updatedAt: outboxEvent.updatedAt,
                payloadMasked: this.maskSensitiveData(this.parsePayload(outboxEvent.payload)),
            },
        };
    }

    constructor(private readonly outboxService: OutboxService) {}

    private parsePayload(payload: string): unknown {
        try {
            return JSON.parse(payload) as unknown;
        } catch {
            return {
                content: 'payload inválido',
            };
        }
    }

    private maskSensitiveData(value: unknown, parentKey?: string): unknown {
        if (Array.isArray(value)) {
            return value.map((item) => this.maskSensitiveData(item, parentKey));
        }

        if (value === null || value === undefined) {
            return value;
        }

        if (typeof value === 'object') {
            const output: Record<string, unknown> = {};
            const input = value as Record<string, unknown>;
            for (const [key, childValue] of Object.entries(input)) {
                output[key] = this.maskSensitiveData(childValue, key);
            }

            return output;
        }

        if (this.isSensitiveKey(parentKey)) {
            return '***';
        }

        return value;
    }

    private isSensitiveKey(key?: string): boolean {
        if (!key) {
            return false;
        }

        const normalizedKey = key.toLowerCase();

        return this.sensitiveKeys.some((sensitiveKey) => normalizedKey.includes(sensitiveKey));
    }
}

