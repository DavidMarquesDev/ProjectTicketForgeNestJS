import { Job, Queue } from 'bullmq';
import { DataSource, Repository } from 'typeorm';
import { OutboxEventStatus } from '../outbox/entities/outbox-event-status.enum';
import { OutboxEvent } from '../outbox/entities/outbox-event.entity';
import { OutboxService } from '../outbox/outbox.service';
import { OperationalMetricsService } from '../../common/observability/operational-metrics.service';
import { DeadLetterQueueProducer } from './dead-letter-queue.producer';
import { DomainEventsProcessor } from './domain-events.processor';
import { DomainEventsQueueProducer } from './domain-events-queue.producer';
import { OutboxDispatchJobPayload, PROCESS_OUTBOX_EVENT_JOB } from './async-processing.constants';
import { OutboxDispatcherService } from './outbox-dispatcher.service';

describe('OutboxDispatcherService smoke', () => {
    let dataSource: DataSource;
    let outboxRepository: Repository<OutboxEvent>;
    let outboxService: OutboxService;
    let queueAddMock: jest.Mock;
    let queueProducer: DomainEventsQueueProducer;
    let deadLetterQueueProducer: DeadLetterQueueProducer;
    let dispatcher: OutboxDispatcherService;
    let processor: DomainEventsProcessor;
    let notificationDispatcher: { dispatch: jest.Mock };
    let deadLetterQueueAddMock: jest.Mock;
    let operationalMetricsService: {
        recordQueueFailure: jest.Mock;
        recordQueueDispatchBatch: jest.Mock;
        recordQueueProcessingDuration: jest.Mock;
    };
    let asyncQueueEnabledOriginal: string | undefined;

    beforeAll(async () => {
        asyncQueueEnabledOriginal = process.env.ASYNC_QUEUE_ENABLED;
        process.env.ASYNC_QUEUE_ENABLED = 'true';
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            entities: [OutboxEvent],
            synchronize: true,
        });
        await dataSource.initialize();
        outboxRepository = dataSource.getRepository(OutboxEvent);
    });

    beforeEach(async () => {
        await outboxRepository.clear();
        outboxService = new OutboxService(outboxRepository);
        queueAddMock = jest.fn().mockResolvedValue(undefined);
        deadLetterQueueAddMock = jest.fn().mockResolvedValue(undefined);
        notificationDispatcher = {
            dispatch: jest.fn().mockResolvedValue(undefined),
        };
        operationalMetricsService = {
            recordQueueFailure: jest.fn(),
            recordQueueDispatchBatch: jest.fn(),
            recordQueueProcessingDuration: jest.fn(),
        };
        queueProducer = new DomainEventsQueueProducer({ add: queueAddMock } as unknown as Queue<OutboxDispatchJobPayload>);
        deadLetterQueueProducer = new DeadLetterQueueProducer({ add: deadLetterQueueAddMock } as never);
        dispatcher = new OutboxDispatcherService(
            outboxService,
            queueProducer,
            deadLetterQueueProducer,
            operationalMetricsService as unknown as OperationalMetricsService,
        );
        processor = new DomainEventsProcessor(
            outboxService,
            deadLetterQueueProducer,
            operationalMetricsService as unknown as OperationalMetricsService,
            notificationDispatcher as never,
        );
    });

    afterAll(async () => {
        if (asyncQueueEnabledOriginal === undefined) {
            delete process.env.ASYNC_QUEUE_ENABLED;
        } else {
            process.env.ASYNC_QUEUE_ENABLED = asyncQueueEnabledOriginal;
        }
        if (dataSource?.isInitialized) {
            await dataSource.destroy();
        }
    });

    it('deve executar fluxo pending -> queued -> processed', async () => {
        const createdEvent = await outboxService.createPendingEvent({
            eventName: 'TicketCreatedEvent',
            aggregateType: 'ticket',
            aggregateId: '10',
            payload: {
                ticketId: 10,
                createdBy: 1,
            },
        });

        const pending = await outboxRepository.findOneByOrFail({ id: createdEvent.id });
        expect(pending.status).toBe(OutboxEventStatus.PENDING);
        expect(pending.schemaVersion).toBe(1);
        expect(pending.eventId).toBeTruthy();

        await dispatcher.dispatchPendingEvents();

        const queued = await outboxRepository.findOneByOrFail({ id: createdEvent.id });
        expect(queued.status).toBe(OutboxEventStatus.QUEUED);
        expect(queued.queuedAt).not.toBeNull();
        expect(queueAddMock).toHaveBeenCalledTimes(1);

        const job = {
            name: PROCESS_OUTBOX_EVENT_JOB,
            id: createdEvent.id,
            data: {
                outboxEventId: createdEvent.id,
                eventId: queued.eventId,
                eventName: queued.eventName,
                schemaVersion: queued.schemaVersion,
                aggregateType: queued.aggregateType,
                aggregateId: queued.aggregateId,
                traceId: queued.traceId,
                payload: queued.payload,
            },
        } as Job<OutboxDispatchJobPayload>;

        await processor.process(job);

        const processed = await outboxRepository.findOneByOrFail({ id: createdEvent.id });
        expect(processed.status).toBe(OutboxEventStatus.PROCESSED);
        expect(processed.processedAt).not.toBeNull();
    });

    it('deve marcar evento como failed quando enfileiramento falhar', async () => {
        queueAddMock.mockRejectedValueOnce(new Error('Falha de conexão com Redis'));

        const createdEvent = await outboxService.createPendingEvent({
            eventName: 'TicketStatusUpdatedEvent',
            aggregateType: 'ticket',
            aggregateId: '11',
            payload: {
                ticketId: 11,
                updatedBy: 2,
                status: 'in_progress',
            },
        });

        const beforeDispatch = new Date();
        await dispatcher.dispatchPendingEvents();

        const failed = await outboxRepository.findOneByOrFail({ id: createdEvent.id });
        expect(queueAddMock).toHaveBeenCalledTimes(1);
        expect(failed.status).toBe(OutboxEventStatus.FAILED);
        expect(failed.attempts).toBe(1);
        expect(failed.lastError).toBe('Falha de conexão com Redis');
        expect(failed.availableAt.getTime()).toBeGreaterThan(beforeDispatch.getTime());
        expect(deadLetterQueueAddMock).not.toHaveBeenCalled();
    });
});
