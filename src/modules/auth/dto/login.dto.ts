import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: '12345678901',
        description: 'Brazilian CPF with 11 numeric digits and no punctuation',
    })
    @IsString()
    @Matches(/^\d{11}$/)
    cpf: string;

    @ApiProperty({
        example: '12345678',
        description: 'User password with minimum 8 characters',
    })
    @IsString()
    @MinLength(8)
    password: string;
}
