import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { DeadLetterPayloadMaskMode } from '../queries/get-dead-letter-event-by-id/get-dead-letter-event-by-id.query';

export class GetDeadLetterByIdQueryDto {
    @ApiPropertyOptional({
        enum: DeadLetterPayloadMaskMode,
        default: DeadLetterPayloadMaskMode.TOTAL,
        description: 'Define o nível de mascaramento do payload sensível',
    })
    @IsOptional()
    @IsEnum(DeadLetterPayloadMaskMode)
    maskMode?: DeadLetterPayloadMaskMode = DeadLetterPayloadMaskMode.TOTAL;
}

