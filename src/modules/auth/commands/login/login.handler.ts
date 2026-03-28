import { UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { LoginCommand } from './login.command';

type LoginResult = {
    token: string;
    success: true;
};

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    /**
     * Validates user credentials and issues a JWT token.
     *
     * @param command Login command with CPF and password.
     * @returns Access token payload for authenticated requests.
     * @throws UnauthorizedException When CPF or password is invalid.
     */
    async execute(command: LoginCommand): Promise<LoginResult> {
        const user = await this.userRepository.findOne({
            where: { cpf: command.cpf },
            select: ['id', 'cpf', 'email', 'passwordHash', 'role'],
        });

        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const isValid = await compare(command.password, user.passwordHash);

        if (!isValid) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
        });

        return { token, success: true };
    }
}
