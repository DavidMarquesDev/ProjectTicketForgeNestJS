import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { DeadLetterSortBy, DeadLetterSortOrder } from '../../outbox/outbox.service';
import { DeadLetterPayloadMaskMode } from '../queries/get-dead-letter-event-by-id/get-dead-letter-event-by-id.query';

export class ListDeadLetterEventsQueryDto {
    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiPropertyOptional({ description: 'Nome do evento de domínio', example: 'TicketNotificationRequestedEvent' })
    @IsOptional()
    @IsString()
    eventName?: string;

    @ApiPropertyOptional({ description: 'Tipo do agregado', example: 'ticket' })
    @IsOptional()
    @IsString()
    aggregateType?: string;

    @ApiPropertyOptional({ description: 'Data inicial do dead letter (ISO 8601)', example: '2026-03-01T00:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional({ description: 'Data final do dead letter (ISO 8601)', example: '2026-03-31T23:59:59.999Z' })
    @IsOptional()
    @IsDateString()
    to?: string;

    @ApiPropertyOptional({ description: 'Quantidade mínima de tentativas', example: 3 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    attemptsMin?: number;

    @ApiPropertyOptional({ description: 'Quantidade máxima de tentativas', example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    attemptsMax?: number;

    @ApiPropertyOptional({ enum: DeadLetterSortBy, default: DeadLetterSortBy.DEAD_LETTERED_AT })
    @IsOptional()
    @IsEnum(DeadLetterSortBy)
    sortBy?: DeadLetterSortBy = DeadLetterSortBy.DEAD_LETTERED_AT;

    @ApiPropertyOptional({ enum: DeadLetterSortOrder, default: DeadLetterSortOrder.DESC })
    @IsOptional()
    @IsEnum(DeadLetterSortOrder)
    order?: DeadLetterSortOrder = DeadLetterSortOrder.DESC;

    @ApiPropertyOptional({
        enum: DeadLetterPayloadMaskMode,
        default: DeadLetterPayloadMaskMode.TOTAL,
        description: 'Define o nível de mascaramento do payload sensível na listagem',
    })
    @IsOptional()
    @IsEnum(DeadLetterPayloadMaskMode)
    maskMode?: DeadLetterPayloadMaskMode = DeadLetterPayloadMaskMode.TOTAL;
}
