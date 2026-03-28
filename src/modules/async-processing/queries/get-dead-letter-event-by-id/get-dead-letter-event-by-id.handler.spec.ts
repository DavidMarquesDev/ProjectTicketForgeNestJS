import { ConflictException, NotFoundException } from '@nestjs/common';
import { OutboxEventStatus } from '../../../outbox/entities/outbox-event-status.enum';
import { OutboxService } from '../../../outbox/outbox.service';
import { GetDeadLetterEventByIdHandler } from './get-dead-letter-event-by-id.handler';
import { GetDeadLetterEventByIdQuery } from './get-dead-letter-event-by-id.query';

describe('GetDeadLetterEventByIdHandler', () => {
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
        const handler = new GetDeadLetterEventByIdHandler(outboxService);

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

    it('deve lançar not found quando evento não existir', async () => {
        const outboxService = {
            findById: jest.fn().mockResolvedValue(null),
        } as unknown as OutboxService;
        const handler = new GetDeadLetterEventByIdHandler(outboxService);

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
        const handler = new GetDeadLetterEventByIdHandler(outboxService);

        await expect(handler.execute(new GetDeadLetterEventByIdQuery('evt-2'))).rejects.toBeInstanceOf(
            ConflictException,
        );
    });
});

