import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OutboxEventStatus } from '../../../outbox/entities/outbox-event-status.enum';
import { OutboxService } from '../../../outbox/outbox.service';
import { DeadLetterPayloadMaskingService } from '../../services/dead-letter-payload-masking.service';
import { GetDeadLetterEventByIdHandler } from './get-dead-letter-event-by-id.handler';
import {
    DeadLetterPayloadMaskMode,
    GetDeadLetterEventByIdQuery,
} from './get-dead-letter-event-by-id.query';

describe('GetDeadLetterEventByIdHandler', () => {
    const buildMaskingService = (maxPayloadLength?: string): DeadLetterPayloadMaskingService => {
        const configService = {
            get: jest.fn().mockReturnValue(maxPayloadLength),
        } as unknown as ConfigService;

        return new DeadLetterPayloadMaskingService(configService);
    };

    it('deve retornar evento dead letter com payload mascarado', async () => {
        const outboxService = {
            findById: jest.fn().mockResolvedValue({
                id: 'evt-1',
                eventId: 'domain-evt-1',
                eventName: 'TicketNotificationRequestedEvent',
                schemaVersion: 1,
                aggregateType: 'ticket',
                aggregateId: '10',
                status: OutboxEventStatus.DEAD_LETTERED,
                attempts: 5,
                availableAt: new Date(),
                queuedAt: null,
                processedAt: null,
                deadLetteredAt: new Date(),
                lastError: 'Falha final',
                createdAt: new Date(),
                updatedAt: new Date(),
                payload: JSON.stringify({
                    cpf: '12345678901',
                    email: 'user@ticketforge.dev',
                    metadata: {
                        token: 'abc123',
                        ticketId: 10,
                    },
                }),
            }),
        } as unknown as OutboxService;
        const handler = new GetDeadLetterEventByIdHandler(outboxService, buildMaskingService());

        const result = await handler.execute(new GetDeadLetterEventByIdQuery('evt-1'));

        expect(result.success).toBe(true);
        expect(result.data.payloadMasked).toEqual({
            cpf: '***',
            email: '***',
            metadata: {
                token: '***',
                ticketId: 10,
            },
        });
    });

    it('deve aplicar mascaramento parcial para cpf e email', async () => {
        const outboxService = {
            findById: jest.fn().mockResolvedValue({
                id: 'evt-1',
                eventId: 'domain-evt-1',
                eventName: 'TicketNotificationRequestedEvent',
                schemaVersion: 1,
                aggregateType: 'ticket',
                aggregateId: '10',
                status: OutboxEventStatus.DEAD_LETTERED,
                attempts: 5,
                availableAt: new Date(),
                queuedAt: null,
                processedAt: null,
                deadLetteredAt: new Date(),
                lastError: 'Falha final',
                createdAt: new Date(),
                updatedAt: new Date(),
                payload: JSON.stringify({
                    cpf: '12345678901',
                    email: 'user@ticketforge.dev',
                    token: 'abc123',
                }),
            }),
        } as unknown as OutboxService;
        const handler = new GetDeadLetterEventByIdHandler(outboxService, buildMaskingService());

        const result = await handler.execute(
            new GetDeadLetterEventByIdQuery('evt-1', DeadLetterPayloadMaskMode.PARTIAL),
        );

        expect(result.data.payloadMasked).toEqual({
            cpf: '***8901',
            email: 'u***@ticketforge.dev',
            token: '***',
        });
    });

    it('deve truncar payload mascarado quando ultrapassar o limite configurado', async () => {
        const outboxService = {
            findById: jest.fn().mockResolvedValue({
                id: 'evt-1',
                eventId: 'domain-evt-1',
                eventName: 'TicketNotificationRequestedEvent',
                schemaVersion: 1,
                aggregateType: 'ticket',
                aggregateId: '10',
                status: OutboxEventStatus.DEAD_LETTERED,
                attempts: 5,
                availableAt: new Date(),
                queuedAt: null,
                processedAt: null,
                deadLetteredAt: new Date(),
                lastError: 'Falha final',
                createdAt: new Date(),
                updatedAt: new Date(),
                payload: JSON.stringify({
                    token: 'abc123',
                    largeContent: 'x'.repeat(500),
                }),
            }),
        } as unknown as OutboxService;
        const handler = new GetDeadLetterEventByIdHandler(outboxService, buildMaskingService('256'));

        const result = await handler.execute(new GetDeadLetterEventByIdQuery('evt-1'));

        expect(result.data.payloadMasked).toMatchObject({
            truncated: true,
            maxLength: 256,
        });
    });

    it('deve lançar not found quando evento não existir', async () => {
        const outboxService = {
            findById: jest.fn().mockResolvedValue(null),
        } as unknown as OutboxService;
        const handler = new GetDeadLetterEventByIdHandler(outboxService, buildMaskingService());

        await expect(handler.execute(new GetDeadLetterEventByIdQuery('evt-404'))).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });

    it('deve lançar conflict quando evento não estiver em dead letter', async () => {
        const outboxService = {
            findById: jest.fn().mockResolvedValue({
                id: 'evt-2',
                status: OutboxEventStatus.PROCESSED,
            }),
        } as unknown as OutboxService;
        const handler = new GetDeadLetterEventByIdHandler(outboxService, buildMaskingService());

        await expect(handler.execute(new GetDeadLetterEventByIdQuery('evt-2'))).rejects.toBeInstanceOf(
            ConflictException,
        );
    });
});
