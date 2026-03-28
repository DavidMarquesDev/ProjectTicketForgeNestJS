import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
    @ApiProperty({
        example: 'Issue acknowledged. Working on a fix.',
        description: 'Comment content related to the ticket',
    })
    @IsString()
    @MinLength(2)
    content: string;
}
