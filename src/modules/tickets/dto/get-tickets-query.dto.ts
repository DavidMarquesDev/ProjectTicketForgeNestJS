import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { TicketStatus } from '../entities/ticket-status.enum';
import { TicketSortBy, TicketSortOrder } from '../repositories/ticket.repository.interface';

export class GetTicketsQueryDto {
    @ApiPropertyOptional({ enum: TicketStatus })
    @IsOptional()
    @IsEnum(TicketStatus)
    status?: TicketStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    assigneeId?: number;

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

    @ApiPropertyOptional({ enum: TicketSortBy, default: TicketSortBy.CREATED_AT })
    @IsOptional()
    @IsEnum(TicketSortBy)
    sortBy?: TicketSortBy = TicketSortBy.CREATED_AT;

    @ApiPropertyOptional({ enum: TicketSortOrder, default: TicketSortOrder.DESC })
    @IsOptional()
    @IsEnum(TicketSortOrder)
    order?: TicketSortOrder = TicketSortOrder.DESC;
}
