import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty()
    @IsString()
    @MinLength(3)
    name: string;

    @ApiProperty({ example: '12345678901' })
    @IsString()
    @Matches(/^\d{11}$/)
    cpf: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    password: string;
}
