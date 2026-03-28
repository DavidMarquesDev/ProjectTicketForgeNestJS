import { ConflictException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { RegisterCommand } from './register.command';

type RegisterResult = {
    success: true;
    data: {
        id: number;
        name: string;
        cpf: string;
        email: string;
        role: UserRole;
    };
};

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    /**
     * Creates a new user account when CPF and e-mail are unique.
     *
     * @param command Registration command payload.
     * @returns Created user data.
     * @throws ConflictException When CPF or e-mail already exists.
     */
    async execute(command: RegisterCommand): Promise<RegisterResult> {
        const userWithEmail = await this.userRepository.exists({
            where: { email: command.email },
        });

        if (userWithEmail) {
            throw new ConflictException('E-mail já cadastrado');
        }

        const userWithCpf = await this.userRepository.exists({
            where: { cpf: command.cpf },
        });

        if (userWithCpf) {
            throw new ConflictException('CPF já cadastrado');
        }

        const passwordHash = await hash(command.password, 10);

        const createdUser = await this.userRepository.save(
            this.userRepository.create({
                name: command.name,
                cpf: command.cpf,
                email: command.email,
                passwordHash,
                role: UserRole.USER,
            }),
        );

        return {
            success: true,
            data: {
                id: createdUser.id,
                name: createdUser.name,
                cpf: createdUser.cpf,
                email: createdUser.email,
                role: createdUser.role,
            },
        };
    }
}
