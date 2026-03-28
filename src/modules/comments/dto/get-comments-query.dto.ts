import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { CommentSortOrder } from '../repositories/comment.repository.interface';

export class GetCommentsQueryDto {
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

    @ApiPropertyOptional({ enum: CommentSortOrder, default: CommentSortOrder.DESC })
    @IsOptional()
    @IsEnum(CommentSortOrder)
    order?: CommentSortOrder = CommentSortOrder.DESC;
}
