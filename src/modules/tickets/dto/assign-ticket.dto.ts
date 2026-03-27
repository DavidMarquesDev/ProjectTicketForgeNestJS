import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AssignTicketDto {
    @ApiProperty()
    @IsInt()
    @Min(1)
    userId: number;
}
