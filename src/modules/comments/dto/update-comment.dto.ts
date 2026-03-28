import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateCommentDto {
    @ApiProperty({
        example: 'Atualização: o problema foi reproduzido e está em correção.',
        description: 'Updated comment content',
    })
    @IsString()
    @MinLength(2)
    content: string;
}
