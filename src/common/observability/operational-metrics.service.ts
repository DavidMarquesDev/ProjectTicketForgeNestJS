import { Injectable } from '@nestjs/common';

type HttpRouteMetrics = {
    count: number;
    statusCodes: Map<number, number>;
    durationsMs: number[];
};

type QueueRuntimeMetrics = {
    dispatchBatches: number;
    dispatchedEvents: number;
    processingFailures: number;
    processingDurationsMs: number[];
};

type QueueCounters = {
    pendingBacklog: number;
    failedBacklog: number;
    deadLetterBacklog: number;
};

type QueuePendingTime = {
    averagePendingSeconds: number;
    oldestPendingSeconds: number;
    samples: number;
};

type QueueSnapshotInput = QueueCounters & {
    pendingTime?: QueuePendingTime;
};

@Injectable()
export class OperationalMetricsService {
    private readonly maxDurationSamplesPerRoute = 500;
    private readonly maxQueueDurationSamples = 1000;
    private readonly routesMetrics = new Map<string, HttpRouteMetrics>();
    private readonly queueRuntimeMetrics: QueueRuntimeMetrics = {
        dispatchBatches: 0,
        dispatchedEvents: 0,
        processingFailures: 0,
        processingDurationsMs: [],
    };

    /**
     * Registra métricas de uma requisição HTTP concluída.
     *
     * @param method Método HTTP.
     * @param route Rota normalizada.
     * @param statusCode Código de status da resposta.
     * @param durationMs Latência da requisição em milissegundos.
     * @returns Void.
     *
     * @example
     * metrics.recordHttpRequest('GET', '/api/v1/tickets/:id', 200, 12.4);
     *
     * @author David <github.com/DavidMarquesDev>
     */
    public recordHttpRequest(
        method: string,
        route: string,
        statusCode: number,
        durationMs: number,
    ): void {
        const routeKey = `${method.toUpperCase()} ${route}`;
        const current = this.routesMetrics.get(routeKey) ?? this.createEmptyHttpRouteMetrics();

        current.count += 1;
        current.statusCodes.set(statusCode, (current.statusCodes.get(statusCode) ?? 0) + 1);
        current.durationsMs.push(durationMs);

        if (current.durationsMs.length > this.maxDurationSamplesPerRoute) {
            current.durationsMs.shift();
        }

        this.routesMetrics.set(routeKey, current);
    }

    /**
     * Registra lote processado pelo dispatcher da fila.
     *
     * @param dispatchedCount Quantidade de eventos enfileirados no lote.
     * @returns Void.
     *
     * @example
     * metrics.recordQueueDispatchBatch(25);
     *
     * @author David <github.com/DavidMarquesDev>
     */
    public recordQueueDispatchBatch(dispatchedCount: number): void {
        this.queueRuntimeMetrics.dispatchBatches += 1;
        this.queueRuntimeMetrics.dispatchedEvents += Math.max(dispatchedCount, 0);
    }

    /**
     * Registra falha de processamento assíncrono.
     *
     * @returns Void.
     *
     * @example
     * metrics.recordQueueFailure();
     *
     * @author David <github.com/DavidMarquesDev>
     */
    public recordQueueFailure(): void {
        this.queueRuntimeMetrics.processingFailures += 1;
    }

    /**
     * Registra latência de processamento de evento assíncrono.
     *
     * @param durationMs Duração da execução do job em milissegundos.
     * @returns Void.
     *
     * @example
     * metrics.recordQueueProcessingDuration(35.2);
     *
     * @author David <github.com/DavidMarquesDev>
     */
    public recordQueueProcessingDuration(durationMs: number): void {
        this.queueRuntimeMetrics.processingDurationsMs.push(durationMs);

        if (this.queueRuntimeMetrics.processingDurationsMs.length > this.maxQueueDurationSamples) {
            this.queueRuntimeMetrics.processingDurationsMs.shift();
        }
    }

    /**
     * Consolida snapshot operacional para dashboards e troubleshooting.
     *
     * @param queueCounters Contadores atuais de backlog da fila.
     * @returns Estrutura consolidada de métricas HTTP e assíncronas.
     *
     * @example
     * metrics.buildSnapshot({ pendingBacklog: 2, failedBacklog: 0, deadLetterBacklog: 1 });
     *
     * @author David <github.com/DavidMarquesDev>
     */
    public buildSnapshot(queueCounters: QueueSnapshotInput): {
        generatedAt: string;
        http: {
            totalRequests: number;
            routes: Array<{
                route: string;
                requests: number;
                statusCodes: Record<string, number>;
                latencyMs: {
                    p50: number;
                    p95: number;
                    p99: number;
                    average: number;
                    max: number;
                };
            }>;
        };
        queue: {
            backlog: QueueCounters;
            pendingTime: QueuePendingTime;
            runtime: {
                dispatchBatches: number;
                dispatchedEvents: number;
                processingFailures: number;
                latencyMs: {
                    p50: number;
                    p95: number;
                    p99: number;
                    average: number;
                    max: number;
                };
            };
        };
    } {
        const routes = [...this.routesMetrics.entries()].map(([route, metrics]) => {
            return {
                route,
                requests: metrics.count,
                statusCodes: this.mapToRecord(metrics.statusCodes),
                latencyMs: this.computeLatency(metrics.durationsMs),
            };
        });
        const totalRequests = routes.reduce((total, route) => total + route.requests, 0);

        return {
            generatedAt: new Date().toISOString(),
            http: {
                totalRequests,
                routes,
            },
            queue: {
                backlog: {
                    pendingBacklog: queueCounters.pendingBacklog,
                    failedBacklog: queueCounters.failedBacklog,
                    deadLetterBacklog: queueCounters.deadLetterBacklog,
                },
                pendingTime: queueCounters.pendingTime ?? {
                    averagePendingSeconds: 0,
                    oldestPendingSeconds: 0,
                    samples: 0,
                },
                runtime: {
                    dispatchBatches: this.queueRuntimeMetrics.dispatchBatches,
                    dispatchedEvents: this.queueRuntimeMetrics.dispatchedEvents,
                    processingFailures: this.queueRuntimeMetrics.processingFailures,
                    latencyMs: this.computeLatency(this.queueRuntimeMetrics.processingDurationsMs),
                },
            },
        };
    }

    private createEmptyHttpRouteMetrics(): HttpRouteMetrics {
        return {
            count: 0,
            statusCodes: new Map<number, number>(),
            durationsMs: [],
        };
    }

    private mapToRecord(map: Map<number, number>): Record<string, number> {
        return [...map.entries()].reduce<Record<string, number>>((accumulator, [status, count]) => {
            accumulator[String(status)] = count;
            return accumulator;
        }, {});
    }

    private computeLatency(values: number[]): {
        p50: number;
        p95: number;
        p99: number;
        average: number;
        max: number;
    } {
        if (values.length === 0) {
            return {
                p50: 0,
                p95: 0,
                p99: 0,
                average: 0,
                max: 0,
            };
        }

        const sorted = [...values].sort((a, b) => a - b);
        const sum = sorted.reduce((accumulator, value) => accumulator + value, 0);

        return {
            p50: this.percentile(sorted, 50),
            p95: this.percentile(sorted, 95),
            p99: this.percentile(sorted, 99),
            average: Number((sum / sorted.length).toFixed(2)),
            max: Number(sorted[sorted.length - 1].toFixed(2)),
        };
    }

    private percentile(sortedValues: number[], percentileValue: number): number {
        const index = Math.min(
            sortedValues.length - 1,
            Math.ceil((percentileValue / 100) * sortedValues.length) - 1,
        );

        return Number(sortedValues[Math.max(index, 0)].toFixed(2));
    }
}
