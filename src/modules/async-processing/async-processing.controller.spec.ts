import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { OperationalMetricsService } from '../../common/observability/operational-metrics.service';
import { OutboxService } from '../outbox/outbox.service';
import { AsyncProcessingController } from './async-processing.controller';
import { ReprocessDeadLetterEventCommand } from './commands/reprocess-dead-letter-event/reprocess-dead-letter-event.command';
import { DeadLetterPayloadMaskMode } from './queries/get-dead-letter-event-by-id/get-dead-letter-event-by-id.query';

describe('AsyncProcessingController', () => {
    it('deve reenfileirar evento da dead letter via command bus', async () => {
        const commandBus = {
            execute: jest.fn().mockResolvedValue({
                success: true,
                data: {
                    outboxEventId: 'evt-1',
                    status: 'queued',
                    reprocessedBy: 1,
                },
            }),
        } as unknown as CommandBus;
        const queryBus = {
            execute: jest.fn(),
        } as unknown as QueryBus;
        const outboxService = {
            countByStatuses: jest.fn(),
            countByStatus: jest.fn(),
            getPendingTimeStats: jest.fn(),
        } as unknown as OutboxService;
        const operationalMetricsService = {
            buildSnapshot: jest.fn(),
        } as unknown as OperationalMetricsService;
        const controller = new AsyncProcessingController(commandBus, queryBus, outboxService, operationalMetricsService);

        const result = await controller.reprocessDeadLetter('evt-1', {
            id: 1,
            email: 'admin@ticketforge.dev',
            role: 'admin',
        });

        expect(result).toEqual({
            success: true,
            data: {
                outboxEventId: 'evt-1',
                status: 'queued',
                reprocessedBy: 1,
            },
        });
        expect(commandBus.execute).toHaveBeenCalledWith(
            expect.any(ReprocessDeadLetterEventCommand),
        );
    });

    it('deve listar eventos da dead letter via query bus', async () => {
        const commandBus = {
            execute: jest.fn(),
        } as unknown as CommandBus;
        const queryBus = {
            execute: jest.fn().mockResolvedValue({
                success: true,
                data: [],
                meta: {
                    page: 1,
                    limit: 20,
                    total: 0,
                    totalPages: 1,
                },
            }),
        } as unknown as QueryBus;
        const outboxService = {
            countByStatuses: jest.fn(),
            countByStatus: jest.fn(),
            getPendingTimeStats: jest.fn(),
        } as unknown as OutboxService;
        const operationalMetricsService = {
            buildSnapshot: jest.fn(),
        } as unknown as OperationalMetricsService;
        const controller = new AsyncProcessingController(commandBus, queryBus, outboxService, operationalMetricsService);

        const result = await controller.listDeadLetters({
            page: 1,
            limit: 20,
            sortBy: undefined,
            order: undefined,
            maskMode: DeadLetterPayloadMaskMode.PARTIAL,
        });

        expect(result).toEqual({
            success: true,
            data: [],
            meta: {
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 1,
            },
        });
        expect(queryBus.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                filters: expect.objectContaining({
                    maskMode: DeadLetterPayloadMaskMode.PARTIAL,
                }),
            }),
        );
    });

    it('deve buscar detalhe de evento da dead letter por id via query bus', async () => {
        const commandBus = {
            execute: jest.fn(),
        } as unknown as CommandBus;
        const queryBus = {
            execute: jest.fn().mockResolvedValue({
                success: true,
                data: {
                    id: 'evt-1',
                },
            }),
        } as unknown as QueryBus;
        const outboxService = {
            countByStatuses: jest.fn(),
            countByStatus: jest.fn(),
            getPendingTimeStats: jest.fn(),
        } as unknown as OutboxService;
        const operationalMetricsService = {
            buildSnapshot: jest.fn(),
        } as unknown as OperationalMetricsService;
        const controller = new AsyncProcessingController(commandBus, queryBus, outboxService, operationalMetricsService);

        const result = await controller.getDeadLetterById('evt-1', {
            maskMode: DeadLetterPayloadMaskMode.PARTIAL,
        });

        expect(result).toEqual({
            success: true,
            data: {
                id: 'evt-1',
            },
        });
        expect(queryBus.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                outboxEventId: 'evt-1',
                maskMode: DeadLetterPayloadMaskMode.PARTIAL,
            }),
        );
    });

    it('deve retornar snapshot de métricas operacionais', async () => {
        const commandBus = {
            execute: jest.fn(),
        } as unknown as CommandBus;
        const queryBus = {
            execute: jest.fn(),
        } as unknown as QueryBus;
        const outboxService = {
            countByStatuses: jest.fn().mockResolvedValue(7),
            countByStatus: jest.fn()
                .mockResolvedValueOnce(2)
                .mockResolvedValueOnce(1),
            getPendingTimeStats: jest.fn().mockResolvedValue({
                averagePendingSeconds: 21.4,
                oldestPendingSeconds: 180,
                samples: 7,
            }),
        } as unknown as OutboxService;
        const operationalMetricsService = {
            buildSnapshot: jest.fn().mockReturnValue({
                generatedAt: '2026-03-28T00:00:00.000Z',
                http: { totalRequests: 10, routes: [] },
                queue: {
                    backlog: { pendingBacklog: 7, failedBacklog: 2, deadLetterBacklog: 1 },
                    pendingTime: {
                        averagePendingSeconds: 21.4,
                        oldestPendingSeconds: 180,
                        samples: 7,
                    },
                    runtime: {
                        dispatchBatches: 1,
                        dispatchedEvents: 3,
                        processingFailures: 0,
                        latencyMs: { p50: 1, p95: 2, p99: 3, average: 1.5, max: 3 },
                    },
                },
            }),
        } as unknown as OperationalMetricsService;
        const controller = new AsyncProcessingController(commandBus, queryBus, outboxService, operationalMetricsService);

        const result = await controller.getOperationalMetrics();

        expect(outboxService.countByStatuses).toHaveBeenCalledTimes(1);
        expect(outboxService.countByStatus).toHaveBeenCalledTimes(2);
        expect(operationalMetricsService.buildSnapshot).toHaveBeenCalledWith({
            pendingBacklog: 7,
            failedBacklog: 2,
            deadLetterBacklog: 1,
            pendingTime: {
                averagePendingSeconds: 21.4,
                oldestPendingSeconds: 180,
                samples: 7,
            },
        });
        expect(result).toEqual(
            expect.objectContaining({
                http: expect.objectContaining({ totalRequests: 10 }),
            }),
        );
    });

    it('deve retornar alertas de SLO a partir do snapshot operacional', async () => {
        const commandBus = {
            execute: jest.fn(),
        } as unknown as CommandBus;
        const queryBus = {
            execute: jest.fn(),
        } as unknown as QueryBus;
        const outboxService = {
            countByStatuses: jest.fn().mockResolvedValue(4),
            countByStatus: jest.fn()
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(0),
            getPendingTimeStats: jest.fn().mockResolvedValue({
                averagePendingSeconds: 10,
                oldestPendingSeconds: 40,
                samples: 4,
            }),
        } as unknown as OutboxService;
        const operationalMetricsService = {
            buildSnapshot: jest.fn().mockReturnValue({
                generatedAt: '2026-03-28T00:00:00.000Z',
                http: { totalRequests: 10, routes: [] },
                queue: {
                    backlog: { pendingBacklog: 4, failedBacklog: 1, deadLetterBacklog: 0 },
                    pendingTime: {
                        averagePendingSeconds: 10,
                        oldestPendingSeconds: 40,
                        samples: 4,
                    },
                    runtime: {
                        dispatchBatches: 2,
                        dispatchedEvents: 10,
                        processingFailures: 0,
                        latencyMs: { p50: 2, p95: 3, p99: 4, average: 2.5, max: 4 },
                    },
                },
            }),
        } as unknown as OperationalMetricsService;
        const controller = new AsyncProcessingController(commandBus, queryBus, outboxService, operationalMetricsService);

        const result = await controller.getOperationalAlerts();

        expect(result).toEqual(
            expect.objectContaining({
                success: true,
                data: expect.objectContaining({
                    status: 'healthy',
                    breaches: 0,
                }),
            }),
        );
    });
});
