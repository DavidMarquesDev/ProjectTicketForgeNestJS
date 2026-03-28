import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: '12345678901' })
    @IsString()
    @Matches(/^\d{11}$/)
    cpf: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    password: string;
}
