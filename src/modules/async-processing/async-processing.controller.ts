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
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
    getDeadLetterByIdApiConflictResponse,
    getDeadLetterByIdApiOkResponse,
    getDeadLetterByIdApiOperation,
    getDeadLetterByIdApiParam,
    listDeadLettersApiBadRequestResponse,
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
    @ApiOkResponse(getDeadLetterByIdApiOkResponse)
    @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
    @ApiNotFoundResponse(reprocessDeadLetterApiNotFoundResponse)
    @ApiConflictResponse(getDeadLetterByIdApiConflictResponse)
    @Get('dead-letters/:outboxEventId')
    getDeadLetterById(@Param('outboxEventId') outboxEventId: string) {
        return this.queryBus.execute(new GetDeadLetterEventByIdQuery(outboxEventId));
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
}
