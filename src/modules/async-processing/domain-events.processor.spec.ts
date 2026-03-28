import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { OutboxEventStatus } from '../outbox/entities/outbox-event-status.enum';
import { DomainEventsProcessor } from './domain-events.processor';
import { PROCESS_OUTBOX_EVENT_JOB } from './async-processing.constants';

describe('DomainEventsProcessor', () => {
    it('deve marcar evento como processado e registrar despacho de notificação', async () => {
        const outboxService = {
            hasProcessedEventWithEventId: jest.fn().mockResolvedValue(false),
            markProcessed: jest.fn(),
            markFailed: jest.fn(),
        };
        const notificationDispatcher = {
            dispatch: jest.fn(),
        };
        const deadLetterQueueProducer = {
            enqueue: jest.fn(),
        };
        const loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
        const processor = new DomainEventsProcessor(
            outboxService as never,
            deadLetterQueueProducer as never,
            notificationDispatcher as never,
        );

        const job = {
            id: 'job-1',
            name: PROCESS_OUTBOX_EVENT_JOB,
            data: {
                outboxEventId: 'evt-1',
                eventId: 'domain-evt-1',
                eventName: 'TicketNotificationRequestedEvent',
                schemaVersion: 1,
                aggregateType: 'notification',
                aggregateId: '10',
                payload: JSON.stringify({ ticketId: 10 }),
            },
        } as unknown as Job;

        await processor.process(job as Job);

        expect(notificationDispatcher.dispatch).toHaveBeenCalledWith({
            eventName: 'TicketNotificationRequestedEvent',
            aggregateId: '10',
            payload: { ticketId: 10 },
        });
        expect(outboxService.markProcessed).toHaveBeenCalledWith('evt-1');
        expect(loggerSpy.mock.calls.some((call) => String(call[0]).includes('"action":"notification_dispatched"'))).toBe(
            true,
        );
        loggerSpy.mockRestore();
    });

    it('deve despachar payload vazio quando JSON for inválido', async () => {
        const outboxService = {
            hasProcessedEventWithEventId: jest.fn().mockResolvedValue(false),
            markProcessed: jest.fn(),
            markFailed: jest.fn(),
        };
        const notificationDispatcher = {
            dispatch: jest.fn(),
        };
        const deadLetterQueueProducer = {
            enqueue: jest.fn(),
        };
        const loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
        const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
        const processor = new DomainEventsProcessor(
            outboxService as never,
            deadLetterQueueProducer as never,
            notificationDispatcher as never,
        );

        const job = {
            id: 'job-2',
            name: PROCESS_OUTBOX_EVENT_JOB,
            data: {
                outboxEventId: 'evt-2',
                eventId: 'domain-evt-2',
                eventName: 'CommentNotificationRequestedEvent',
                schemaVersion: 1,
                aggregateType: 'notification',
                aggregateId: '20',
                payload: '{json_invalido',
            },
        } as unknown as Job;

        await processor.process(job as Job);

        expect(notificationDispatcher.dispatch).toHaveBeenCalledWith({
            eventName: 'CommentNotificationRequestedEvent',
            aggregateId: '20',
            payload: {},
        });
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
        loggerSpy.mockRestore();
    });

    it('deve ignorar evento duplicado quando eventId já tiver sido processado', async () => {
        const outboxService = {
            hasProcessedEventWithEventId: jest.fn().mockResolvedValue(true),
            markProcessed: jest.fn(),
            markFailed: jest.fn(),
        };
        const notificationDispatcher = {
            dispatch: jest.fn(),
        };
        const deadLetterQueueProducer = {
            enqueue: jest.fn(),
        };
        const processor = new DomainEventsProcessor(
            outboxService as never,
            deadLetterQueueProducer as never,
            notificationDispatcher as never,
        );

        const job = {
            id: 'job-3',
            name: PROCESS_OUTBOX_EVENT_JOB,
            data: {
                outboxEventId: 'evt-3',
                eventId: 'domain-evt-duplicado',
                eventName: 'TicketNotificationRequestedEvent',
                schemaVersion: 1,
                aggregateType: 'notification',
                aggregateId: '12',
                payload: JSON.stringify({ ticketId: 12 }),
            },
        } as unknown as Job;

        await processor.process(job as Job);

        expect(notificationDispatcher.dispatch).not.toHaveBeenCalled();
        expect(outboxService.markProcessed).toHaveBeenCalledWith('evt-3');
    });

    it('deve enviar para DLQ quando falha atingir dead letter', async () => {
        const outboxService = {
            markFailed: jest.fn().mockResolvedValue({
                marked: true,
                status: OutboxEventStatus.DEAD_LETTERED,
                attempts: 5,
            }),
        };
        const notificationDispatcher = {
            dispatch: jest.fn(),
        };
        const deadLetterQueueProducer = {
            enqueue: jest.fn(),
        };
        const processor = new DomainEventsProcessor(
            outboxService as never,
            deadLetterQueueProducer as never,
            notificationDispatcher as never,
        );

        await processor.onFailed(
            {
                id: 'job-4',
                data: {
                    outboxEventId: 'evt-4',
                    eventId: 'domain-evt-4',
                    eventName: 'TicketNotificationRequestedEvent',
                    schemaVersion: 1,
                    aggregateType: 'notification',
                    aggregateId: '40',
                    payload: JSON.stringify({ ticketId: 40 }),
                },
            } as unknown as Job,
            new Error('Falha final'),
        );

        expect(deadLetterQueueProducer.enqueue).toHaveBeenCalledTimes(1);
    });
});
