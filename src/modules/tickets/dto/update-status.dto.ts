import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TicketStatus } from '../entities/ticket-status.enum';

export class UpdateStatusDto {
    @ApiProperty({
        enum: TicketStatus,
        example: TicketStatus.IN_PROGRESS,
        description: 'Next status according to transition rules',
    })
    @IsEnum(TicketStatus)
    status: TicketStatus;
}
