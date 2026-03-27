import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateTicketDto {
    @ApiProperty()
    @IsString()
    @MinLength(3)
    title: string;

    @ApiProperty()
    @IsString()
    @MinLength(10)
    description: string;
}
