import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateTicketDto {
    @ApiProperty({
        example: 'Payment gateway timeout',
        description: 'Short and clear ticket title',
    })
    @IsString()
    @MinLength(3)
    title: string;

    @ApiProperty({
        example: 'Users report timeout when confirming card payment in checkout.',
        description: 'Detailed issue description',
    })
    @IsString()
    @MinLength(10)
    description: string;
}
