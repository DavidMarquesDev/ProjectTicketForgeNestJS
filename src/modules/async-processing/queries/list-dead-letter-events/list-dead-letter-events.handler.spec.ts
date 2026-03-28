import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OutboxEventStatus } from '../../../outbox/entities/outbox-event-status.enum';
import { DeadLetterSortBy, DeadLetterSortOrder, OutboxService } from '../../../outbox/outbox.service';
import { DeadLetterPayloadMaskingService } from '../../services/dead-letter-payload-masking.service';
import { DeadLetterPayloadMaskMode } from '../get-dead-letter-event-by-id/get-dead-letter-event-by-id.query';
import { ListDeadLetterEventsHandler } from './list-dead-letter-events.handler';
import { ListDeadLetterEventsQuery } from './list-dead-letter-events.query';

describe('ListDeadLetterEventsHandler', () => {
    const buildMaskingService = (maxPayloadLength?: string): DeadLetterPayloadMaskingService => {
        const configService = {
            get: jest.fn().mockReturnValue(maxPayloadLength),
        } as unknown as ConfigService;

        return new DeadLetterPayloadMaskingService(configService);
    };

    it('deve listar eventos dead letter com paginação', async () => {
        const outboxService = {
            paginateDeadLettered: jest.fn().mockResolvedValue({
                data: [],
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 1,
            }),
        } as unknown as OutboxService;
        const handler = new ListDeadLetterEventsHandler(outboxService, buildMaskingService());

        const result = await handler.execute(
            new ListDeadLetterEventsQuery({
                page: 1,
                limit: 20,
                eventName: 'TicketNotificationRequestedEvent',
                aggregateType: 'ticket',
                sortBy: DeadLetterSortBy.DEAD_LETTERED_AT,
                order: DeadLetterSortOrder.DESC,
            }),
        );

        expect(result.success).toBe(true);
        expect(result.meta.totalPages).toBe(1);
        expect(outboxService.paginateDeadLettered).toHaveBeenCalled();
    });

    it('deve lançar bad request quando attemptsMin for maior que attemptsMax', async () => {
        const outboxService = {
            paginateDeadLettered: jest.fn(),
        } as unknown as OutboxService;
        const handler = new ListDeadLetterEventsHandler(outboxService, buildMaskingService());

        await expect(
            handler.execute(
                new ListDeadLetterEventsQuery({
                    page: 1,
                    limit: 20,
                    attemptsMin: 5,
                    attemptsMax: 2,
                }),
            ),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('deve aplicar mascaramento parcial no payload da listagem', async () => {
        const outboxService = {
            paginateDeadLettered: jest.fn().mockResolvedValue({
                data: [
                    {
                        id: 'evt-1',
                        eventId: 'domain-evt-1',
                        eventName: 'TicketNotificationRequestedEvent',
                        schemaVersion: 1,
                        aggregateType: 'ticket',
                        aggregateId: '10',
                        status: OutboxEventStatus.DEAD_LETTERED,
                        attempts: 3,
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
                            ticketId: 10,
                        }),
                    },
                ],
                total: 1,
                page: 1,
                limit: 20,
                totalPages: 1,
            }),
        } as unknown as OutboxService;
        const handler = new ListDeadLetterEventsHandler(outboxService, buildMaskingService());

        const result = await handler.execute(
            new ListDeadLetterEventsQuery({
                page: 1,
                limit: 20,
                maskMode: DeadLetterPayloadMaskMode.PARTIAL,
            }),
        );

        expect(result.data[0].payloadMasked).toEqual({
            cpf: '***8901',
            email: 'u***@ticketforge.dev',
            token: '***',
            ticketId: 10,
        });
    });

    it('deve truncar payload mascarado na listagem quando ultrapassar o limite configurado', async () => {
        const outboxService = {
            paginateDeadLettered: jest.fn().mockResolvedValue({
                data: [
                    {
                        id: 'evt-1',
                        eventId: 'domain-evt-1',
                        eventName: 'TicketNotificationRequestedEvent',
                        schemaVersion: 1,
                        aggregateType: 'ticket',
                        aggregateId: '10',
                        status: OutboxEventStatus.DEAD_LETTERED,
                        attempts: 3,
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
                    },
                ],
                total: 1,
                page: 1,
                limit: 20,
                totalPages: 1,
            }),
        } as unknown as OutboxService;
        const handler = new ListDeadLetterEventsHandler(outboxService, buildMaskingService('256'));

        const result = await handler.execute(
            new ListDeadLetterEventsQuery({
                page: 1,
                limit: 20,
            }),
        );

        expect(result.data[0].payloadMasked).toMatchObject({
            truncated: true,
            maxLength: 256,
        });
    });
});
