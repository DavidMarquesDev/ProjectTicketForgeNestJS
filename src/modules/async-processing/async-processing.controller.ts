import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConflictResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OperationalMetricsService } from '../../common/observability/operational-metrics.service';
import { OutboxEventStatus } from '../outbox/entities/outbox-event-status.enum';
import { OutboxService } from '../outbox/outbox.service';
import {
    getDeadLetterByIdApiConflictResponse,
    getDeadLetterByIdApiMaskModeQuery,
    getDeadLetterByIdApiOkResponse,
    getDeadLetterByIdApiOperation,
    getDeadLetterByIdApiParam,
    listDeadLettersApiBadRequestResponse,
    listDeadLettersApiMaskModeQuery,
    listDeadLettersApiOkResponse,
    listDeadLettersApiOperation,
    reprocessDeadLetterApiConflictResponse,
    reprocessDeadLetterApiForbiddenResponse,
    reprocessDeadLetterApiNotFoundResponse,
    reprocessDeadLetterApiOkResponse,
    reprocessDeadLetterApiOperation,
    reprocessDeadLetterApiParam,
} from './api/async-processing.http-documentation';
import { ReprocessDeadLetterEventCommand } from './commands/reprocess-dead-letter-event/reprocess-dead-letter-event.command';
import { GetDeadLetterByIdQueryDto } from './dto/get-dead-letter-by-id-query.dto';
import { ListDeadLetterEventsQueryDto } from './dto/list-dead-letter-events-query.dto';
import { GetDeadLetterEventByIdQuery } from './queries/get-dead-letter-event-by-id/get-dead-letter-event-by-id.query';
import { ListDeadLetterEventsQuery } from './queries/list-dead-letter-events/list-dead-letter-events.query';

@ApiTags('async-processing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('async-processing')
export class AsyncProcessingController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly outboxService: OutboxService,
        private readonly operationalMetricsService: OperationalMetricsService,
    ) {}

    /**
     * Lista eventos com status dead_lettered com paginação e filtros.
     *
     * Este endpoint permite a observabilidade operacional da DLQ com filtros por
     * nome do evento, tipo de agregado, janela temporal e faixa de tentativas.
     *
     * @param query Filtros e paginação de consulta da dead letter.
     * @returns Coleção paginada de eventos dead-lettered.
     *
     * @throws BadRequestException Quando os filtros informados são inválidos.
     *
     * @example GET /async-processing/dead-letters?page=1&limit=20&eventName=TicketNotificationRequestedEvent&aggregateType=ticket
     *
     * @author David <github.com/DavidMarquesDev>
     */
    @ApiOperation(listDeadLettersApiOperation)
    @ApiQuery(listDeadLettersApiMaskModeQuery)
    @ApiOkResponse(listDeadLettersApiOkResponse)
    @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
    @ApiBadRequestResponse(listDeadLettersApiBadRequestResponse)
    @Get('dead-letters')
    listDeadLetters(@Query() query: ListDeadLetterEventsQueryDto) {
        return this.queryBus.execute(
            new ListDeadLetterEventsQuery({
                page: query.page ?? 1,
                limit: query.limit ?? 20,
                eventName: query.eventName,
                aggregateType: query.aggregateType,
                from: query.from,
                to: query.to,
                attemptsMin: query.attemptsMin,
                attemptsMax: query.attemptsMax,
                sortBy: query.sortBy,
                order: query.order,
                maskMode: query.maskMode,
            }),
        );
    }

    /**
     * Retorna o detalhe de um evento dead-lettered por identificador.
     *
     * O payload retornado é mascarado para chaves sensíveis, preservando
     * dados operacionais necessários para troubleshooting seguro.
     *
     * @param outboxEventId Identificador UUID do evento no outbox.
     * @param query Filtro de modo de mascaramento do payload.
     * @returns Evento em dead letter com payload mascarado.
     *
     * @throws NotFoundException Quando o evento não existe.
     * @throws ConflictException Quando o evento não está em dead letter.
     *
     * @example GET /async-processing/dead-letters/{outboxEventId}
     *
     * @author David <github.com/DavidMarquesDev>
     */
    @ApiOperation(getDeadLetterByIdApiOperation)
    @ApiParam(getDeadLetterByIdApiParam)
    @ApiQuery(getDeadLetterByIdApiMaskModeQuery)
    @ApiOkResponse(getDeadLetterByIdApiOkResponse)
    @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
    @ApiNotFoundResponse(reprocessDeadLetterApiNotFoundResponse)
    @ApiConflictResponse(getDeadLetterByIdApiConflictResponse)
    @Get('dead-letters/:outboxEventId')
    getDeadLetterById(
        @Param('outboxEventId') outboxEventId: string,
        @Query() query: GetDeadLetterByIdQueryDto,
    ) {
        return this.queryBus.execute(new GetDeadLetterEventByIdQuery(outboxEventId, query.maskMode));
    }

    /**
     * Reprocessa um evento da dead letter queue.
     *
     * O endpoint valida permissões do ator (admin), verifica se o evento existe
     * e se está no estado dead_lettered, então reenvia o evento para a fila
     * principal de processamento assíncrono.
     *
     * @param outboxEventId Identificador do evento de outbox em dead letter.
     * @param user Usuário autenticado extraído do token JWT.
     * @returns Resultado com o id do evento reenfileirado e status queued.
     *
     * @throws ForbiddenException Quando o usuário autenticado não é admin.
     * @throws NotFoundException Quando o evento não é encontrado no outbox.
     * @throws ConflictException Quando o evento não está no estado dead_lettered.
     *
     * @example POST /async-processing/dead-letters/{outboxEventId}/reprocess
     *
     * @author David <github.com/DavidMarquesDev>
     */
    @ApiOperation(reprocessDeadLetterApiOperation)
    @ApiParam(reprocessDeadLetterApiParam)
    @ApiOkResponse(reprocessDeadLetterApiOkResponse)
    @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
    @ApiForbiddenResponse(reprocessDeadLetterApiForbiddenResponse)
    @ApiNotFoundResponse(reprocessDeadLetterApiNotFoundResponse)
    @ApiConflictResponse(reprocessDeadLetterApiConflictResponse)
    @Post('dead-letters/:outboxEventId/reprocess')
    reprocessDeadLetter(
        @Param('outboxEventId') outboxEventId: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.commandBus.execute(
            new ReprocessDeadLetterEventCommand(outboxEventId, user.id, user.role),
        );
    }

    /**
     * Retorna snapshot operacional com métricas HTTP e assíncronas.
     *
     * O endpoint consolida latência por rota (P50/P95/P99), volume por rota,
     * distribuição por status HTTP, backlog da fila e falhas de processamento.
     *
     * @returns Snapshot de métricas operacionais para observabilidade.
     *
     * @example GET /async-processing/metrics
     *
     * @author David <github.com/DavidMarquesDev>
     */
    @ApiOperation({
        summary: 'Snapshot operacional de métricas HTTP e fila',
        description:
            'Retorna métricas de latência, volume, status HTTP, backlog, falhas assíncronas e tempo pendente médio.',
    })
    @ApiOkResponse({
        description: 'Snapshot operacional retornado com sucesso',
    })
    @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
    @Get('metrics')
    async getOperationalMetrics() {
        const [pendingBacklog, failedBacklog, deadLetterBacklog, pendingTime] = await Promise.all([
            this.outboxService.countByStatuses([
                OutboxEventStatus.PENDING,
                OutboxEventStatus.FAILED,
                OutboxEventStatus.QUEUED,
            ]),
            this.outboxService.countByStatus(OutboxEventStatus.FAILED),
            this.outboxService.countByStatus(OutboxEventStatus.DEAD_LETTERED),
            this.outboxService.getPendingTimeStats(),
        ]);

        return this.operationalMetricsService.buildSnapshot({
            pendingBacklog,
            failedBacklog,
            deadLetterBacklog,
            pendingTime,
        });
    }

    @ApiOperation({
        summary: 'Avalia alertas de SLO com base no snapshot operacional',
        description:
            'Retorna estado de SLO para latência P95, falhas de processamento e backlog dead letter com limiares configuráveis por variável de ambiente.',
    })
    @ApiOkResponse({
        description: 'Avaliação de alertas SLO retornada com sucesso',
    })
    @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
    @Get('metrics/alerts')
    async getOperationalAlerts() {
        const snapshot = await this.getOperationalMetrics();
        const queueLatencyP95 = snapshot.queue.runtime.latencyMs.p95;
        const deadLetterBacklog = snapshot.queue.backlog.deadLetterBacklog;
        const queueFailures = snapshot.queue.runtime.processingFailures;
        const queuePendingAverageSeconds = snapshot.queue.pendingTime.averagePendingSeconds;
        const maxQueueLatencyP95Ms = Number(process.env.SLO_QUEUE_LATENCY_P95_MS ?? 800);
        const maxDeadLetterBacklog = Number(process.env.SLO_DEAD_LETTER_BACKLOG_MAX ?? 0);
        const maxQueueFailures = Number(process.env.SLO_QUEUE_FAILURES_MAX ?? 0);
        const maxQueuePendingAverageSeconds = Number(process.env.SLO_QUEUE_PENDING_AVG_SECONDS_MAX ?? 120);
        const checks = [
            {
                metric: 'queue_latency_p95_ms',
                current: queueLatencyP95,
                threshold: maxQueueLatencyP95Ms,
                status: queueLatencyP95 <= maxQueueLatencyP95Ms ? 'ok' : 'breach',
            },
            {
                metric: 'dead_letter_backlog',
                current: deadLetterBacklog,
                threshold: maxDeadLetterBacklog,
                status: deadLetterBacklog <= maxDeadLetterBacklog ? 'ok' : 'breach',
            },
            {
                metric: 'queue_processing_failures',
                current: queueFailures,
                threshold: maxQueueFailures,
                status: queueFailures <= maxQueueFailures ? 'ok' : 'breach',
            },
            {
                metric: 'queue_pending_avg_seconds',
                current: queuePendingAverageSeconds,
                threshold: maxQueuePendingAverageSeconds,
                status: queuePendingAverageSeconds <= maxQueuePendingAverageSeconds ? 'ok' : 'breach',
            },
        ];
        const breachedChecks = checks.filter((check) => check.status === 'breach');

        return {
            success: true,
            data: {
                status: breachedChecks.length === 0 ? 'healthy' : 'degraded',
                checks,
                breaches: breachedChecks.length,
                generatedAt: snapshot.generatedAt,
            },
            meta: {
                thresholds: {
                    maxQueueLatencyP95Ms,
                    maxDeadLetterBacklog,
                    maxQueueFailures,
                    maxQueuePendingAverageSeconds,
                },
            },
        };
    }
}
