import { Inject, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { IUserRepository, USER_REPOSITORY } from '../../repositories/user.repository.interface';
import { LoginCommand } from './login.command';

type LoginResult = {
    token: string;
    success: true;
};

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
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
        const user = await this.userRepository.findAuthByCpf(command.cpf);

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
