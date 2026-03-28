import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdempotencyKey } from './entities/idempotency-key.entity';

type ExecuteIdempotentInput<T> = {
    scope: string;
    actorId: number;
    key?: string;
    action: () => Promise<T>;
};

@Injectable()
export class IdempotencyService {
    constructor(
        @InjectRepository(IdempotencyKey)
        private readonly idempotencyRepository: Repository<IdempotencyKey>,
    ) {}

    /**
     * Executes a mutable operation with idempotency protection when key is provided.
     *
     * @param input Idempotency execution payload.
     * @returns Cached response for existing key or fresh action result.
     * @throws BadRequestException When key format is invalid.
     */
    async execute<T>(input: ExecuteIdempotentInput<T>): Promise<T> {
        const normalizedKey = this.normalizeKey(input.key);
        if (!normalizedKey) {
            return input.action();
        }

        const cached = await this.idempotencyRepository.findOne({
            where: {
                scope: input.scope,
                actorId: input.actorId,
                key: normalizedKey,
            },
        });

        if (cached) {
            return JSON.parse(cached.responsePayload) as T;
        }

        const response = await input.action();

        try {
            await this.idempotencyRepository.save(
                this.idempotencyRepository.create({
                    scope: input.scope,
                    actorId: input.actorId,
                    key: normalizedKey,
                    responsePayload: JSON.stringify(response),
                }),
            );
            return response;
        } catch (error) {
            if (!this.isUniqueViolation(error)) {
                throw error;
            }

            const concurrentCached = await this.idempotencyRepository.findOne({
                where: {
                    scope: input.scope,
                    actorId: input.actorId,
                    key: normalizedKey,
                },
            });

            if (concurrentCached) {
                return JSON.parse(concurrentCached.responsePayload) as T;
            }

            throw error;
        }
    }

    private normalizeKey(rawKey?: string): string | undefined {
        if (rawKey === undefined) {
            return undefined;
        }

        const normalized = rawKey.trim();
        if (!normalized) {
            return undefined;
        }

        if (normalized.length > 120) {
            throw new BadRequestException('Header Idempotency-Key excede o limite de 120 caracteres');
        }

        return normalized;
    }

    private isUniqueViolation(error: unknown): boolean {
        if (!error || typeof error !== 'object') {
            return false;
        }

        const databaseCode = 'code' in error ? String(error.code) : '';
        if (databaseCode === '23505' || databaseCode === 'SQLITE_CONSTRAINT') {
            return true;
        }

        const message = 'message' in error ? String(error.message) : '';
        return message.toLowerCase().includes('unique');
    }
}

