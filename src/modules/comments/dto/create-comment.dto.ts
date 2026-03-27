import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
    @ApiProperty()
    @IsString()
    @MinLength(2)
    content: string;
}
