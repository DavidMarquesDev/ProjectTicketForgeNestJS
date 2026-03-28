import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AssignTicketDto {
    @ApiProperty({
        example: 2,
        description: 'Identifier of the user that will receive the ticket',
    })
    @IsInt()
    @Min(1)
    userId: number;
}
