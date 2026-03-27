import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TicketStatus } from '../entities/ticket-status.enum';

export class UpdateStatusDto {
    @ApiProperty({ enum: TicketStatus })
    @IsEnum(TicketStatus)
    status: TicketStatus;
}
