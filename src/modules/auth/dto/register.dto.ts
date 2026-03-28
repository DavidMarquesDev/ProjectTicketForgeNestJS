import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        example: 'João da Silva',
        description: 'Full name of the user',
    })
    @IsString()
    @MinLength(3)
    name: string;

    @ApiProperty({
        example: '12345678901',
        description: 'Brazilian CPF with 11 numeric digits and no punctuation',
    })
    @IsString()
    @Matches(/^\d{11}$/)
    cpf: string;

    @ApiProperty({
        example: 'joao@email.com',
        description: 'User e-mail address',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '12345678',
        description: 'User password with minimum 8 characters',
    })
    @IsString()
    @MinLength(8)
    password: string;
}
