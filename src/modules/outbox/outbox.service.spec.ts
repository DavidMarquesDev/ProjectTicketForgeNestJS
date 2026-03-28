import { DataSource, Repository } from 'typeorm';
import { OutboxEvent } from './entities/outbox-event.entity';
import { OutboxEventStatus } from './entities/outbox-event-status.enum';
import { OutboxService } from './outbox.service';

describe('OutboxService', () => {
    let dataSource: DataSource;
    let outboxRepository: Repository<OutboxEvent>;
    let outboxService: OutboxService;
    let outboxMaxAttemptsOriginal: string | undefined;

    beforeAll(async () => {
        outboxMaxAttemptsOriginal = process.env.OUTBOX_MAX_ATTEMPTS;
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
    });

    afterAll(async () => {
        if (outboxMaxAttemptsOriginal === undefined) {
            delete process.env.OUTBOX_MAX_ATTEMPTS;
        } else {
            process.env.OUTBOX_MAX_ATTEMPTS = outboxMaxAttemptsOriginal;
        }

        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    });

    it('deve manter status failed quando tentativas não atingirem limite', async () => {
        process.env.OUTBOX_MAX_ATTEMPTS = '3';
        outboxService = new OutboxService(outboxRepository);
        const event = await outboxService.createPendingEvent({
            eventName: 'TicketCreatedEvent',
            aggregateType: 'ticket',
            aggregateId: '11',
            payload: { ticketId: 11 },
        });

        const result = await outboxService.markFailed(event.id, 'Erro transitório');
        const persisted = await outboxRepository.findOneByOrFail({ id: event.id });

        expect(result.status).toBe(OutboxEventStatus.FAILED);
        expect(persisted.status).toBe(OutboxEventStatus.FAILED);
        expect(persisted.deadLetteredAt).toBeNull();
    });

    it('deve mover para dead letter ao atingir limite de tentativas', async () => {
        process.env.OUTBOX_MAX_ATTEMPTS = '2';
        outboxService = new OutboxService(outboxRepository);
        const event = await outboxService.createPendingEvent({
            eventName: 'TicketCreatedEvent',
            aggregateType: 'ticket',
            aggregateId: '12',
            payload: { ticketId: 12 },
        });

        await outboxService.markFailed(event.id, 'Erro transitório');
        const result = await outboxService.markFailed(event.id, 'Erro final');
        const persisted = await outboxRepository.findOneByOrFail({ id: event.id });

        expect(result.status).toBe(OutboxEventStatus.DEAD_LETTERED);
        expect(result.attempts).toBe(2);
        expect(persisted.status).toBe(OutboxEventStatus.DEAD_LETTERED);
        expect(persisted.deadLetteredAt).not.toBeNull();
        expect(persisted.lastError).toBe('Erro final');
    });

    it('deve paginar eventos dead letter com filtros', async () => {
        process.env.OUTBOX_MAX_ATTEMPTS = '1';
        outboxService = new OutboxService(outboxRepository);
        const deadLetterEvent = await outboxService.createPendingEvent({
            eventName: 'TicketNotificationRequestedEvent',
            aggregateType: 'ticket',
            aggregateId: '99',
            payload: { ticketId: 99 },
        });

        await outboxService.markFailed(deadLetterEvent.id, 'Falha final');

        await outboxService.createPendingEvent({
            eventName: 'TicketCreatedEvent',
            aggregateType: 'ticket',
            aggregateId: '100',
            payload: { ticketId: 100 },
        });

        const result = await outboxService.paginateDeadLettered({
            page: 1,
            limit: 20,
            eventName: 'TicketNotificationRequestedEvent',
        });

        expect(result.total).toBe(1);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].status).toBe(OutboxEventStatus.DEAD_LETTERED);
    });

    it('deve retornar estatísticas de tempo pendente para backlog assíncrono', async () => {
        outboxService = new OutboxService(outboxRepository);
        await outboxService.createPendingEvent({
            eventName: 'TicketCreatedEvent',
            aggregateType: 'ticket',
            aggregateId: '200',
            payload: { ticketId: 200 },
        });
        await outboxService.createPendingEvent({
            eventName: 'TicketStatusUpdatedEvent',
            aggregateType: 'ticket',
            aggregateId: '201',
            payload: { ticketId: 201 },
        });

        const stats = await outboxService.getPendingTimeStats();

        expect(stats.samples).toBe(2);
        expect(stats.averagePendingSeconds).toBeGreaterThanOrEqual(0);
        expect(stats.oldestPendingSeconds).toBeGreaterThanOrEqual(stats.averagePendingSeconds);
    });
});
