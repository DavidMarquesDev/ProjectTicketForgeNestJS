import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { hash } from 'bcryptjs';
import { UserRole } from '../../entities/user.entity';
import { IUserRepository, USER_REPOSITORY } from '../../repositories/user.repository.interface';
import { RegisterCommand } from './register.command';

type RegisterResult = {
    success: true;
    data: {
        id: number;
    };
};

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    /**
     * Creates a new user account when CPF and e-mail are unique.
     *
     * @param command Registration command payload.
     * @returns Created user data.
     * @throws ConflictException When CPF or e-mail already exists.
     */
    async execute(command: RegisterCommand): Promise<RegisterResult> {
        const userWithEmail = await this.userRepository.existsByEmail(command.data.email);

        if (userWithEmail) {
            throw new ConflictException('E-mail já cadastrado');
        }

        const userWithCpf = await this.userRepository.existsByCpf(command.data.cpf);

        if (userWithCpf) {
            throw new ConflictException('CPF já cadastrado');
        }

        const passwordHash = await hash(command.data.password, 10);

        const createdUser = await this.userRepository.createAndSave({
            name: command.data.name,
            cpf: command.data.cpf,
            email: command.data.email,
            passwordHash,
            role: UserRole.USER,
        });

        return {
            success: true,
            data: {
                id: createdUser.id,
            },
        };
    }
}
