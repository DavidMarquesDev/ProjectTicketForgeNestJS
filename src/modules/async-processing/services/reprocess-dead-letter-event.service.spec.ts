import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { OutboxEventStatus } from '../../outbox/entities/outbox-event-status.enum';
import { ReprocessDeadLetterEventService } from './reprocess-dead-letter-event.service';

describe('ReprocessDeadLetterEventService', () => {
    it('deve reenfileirar evento dead letter com sucesso', async () => {
        const outboxService = {
            findById: jest.fn().mockResolvedValue({
                id: 'evt-1',
                eventId: 'event-1',
                eventName: 'TicketNotificationRequestedEvent',
                schemaVersion: 1,
                aggregateType: 'ticket',
                aggregateId: '10',
                payload: '{"ticketId":10}',
                status: OutboxEventStatus.DEAD_LETTERED,
            }),
            prepareDeadLetterForReprocess: jest.fn().mockResolvedValue(undefined),
        };
        const queueProducer = {
            enqueueOutboxEvent: jest.fn().mockResolvedValue(undefined),
        };
        const policy = {
            assertCanReprocessDeadLetter: jest.fn(),
        };
        const service = new ReprocessDeadLetterEventService(
            outboxService as never,
            queueProducer as never,
            policy as never,
        );

        const result = await service.execute({
            outboxEventId: 'evt-1',
            actorId: 1,
            actorRole: 'admin',
        });

        expect(result).toEqual({
            success: true,
            data: {
                outboxEventId: 'evt-1',
                status: OutboxEventStatus.QUEUED,
                reprocessedBy: 1,
            },
        });
        expect(outboxService.prepareDeadLetterForReprocess).toHaveBeenCalledWith('evt-1');
        expect(queueProducer.enqueueOutboxEvent).toHaveBeenCalledTimes(1);
    });

    it('deve lançar not found quando evento não existir', async () => {
        const service = new ReprocessDeadLetterEventService(
            {
                findById: jest.fn().mockResolvedValue(null),
            } as never,
            {
                enqueueOutboxEvent: jest.fn(),
            } as never,
            {
                assertCanReprocessDeadLetter: jest.fn(),
            } as never,
        );

        await expect(
            service.execute({
                outboxEventId: 'evt-404',
                actorId: 1,
                actorRole: 'admin',
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('deve lançar conflict quando evento não estiver em dead letter', async () => {
        const service = new ReprocessDeadLetterEventService(
            {
                findById: jest.fn().mockResolvedValue({
                    id: 'evt-2',
                    status: OutboxEventStatus.PROCESSED,
                }),
            } as never,
            {
                enqueueOutboxEvent: jest.fn(),
            } as never,
            {
                assertCanReprocessDeadLetter: jest.fn(),
            } as never,
        );

        await expect(
            service.execute({
                outboxEventId: 'evt-2',
                actorId: 1,
                actorRole: 'admin',
            }),
        ).rejects.toBeInstanceOf(ConflictException);
    });

    it('deve propagar erro de permissão quando ator não for admin', async () => {
        const service = new ReprocessDeadLetterEventService(
            {
                findById: jest.fn(),
            } as never,
            {
                enqueueOutboxEvent: jest.fn(),
            } as never,
            {
                assertCanReprocessDeadLetter: jest.fn(() => {
                    throw new ForbiddenException('Sem permissão');
                }),
            } as never,
        );

        await expect(
            service.execute({
                outboxEventId: 'evt-1',
                actorId: 2,
                actorRole: 'user',
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });
});

