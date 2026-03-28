import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserInput, IUserRepository } from './user.repository.interface';

@Injectable()
export class UserTypeOrmRepository implements IUserRepository {
    constructor(
        @InjectRepository(User)
        private readonly ormRepository: Repository<User>,
    ) {}

    async existsByEmail(email: string): Promise<boolean> {
        return this.ormRepository.exists({ where: { email } });
    }

    async existsByCpf(cpf: string): Promise<boolean> {
        return this.ormRepository.exists({ where: { cpf } });
    }

    async createAndSave(input: CreateUserInput): Promise<User> {
        const user = this.ormRepository.create({
            name: input.name,
            cpf: input.cpf,
            email: input.email,
            passwordHash: input.passwordHash,
            role: input.role,
        });

        return this.ormRepository.save(user);
    }

    async findAuthByCpf(cpf: string): Promise<User | null> {
        return this.ormRepository.findOne({
            where: { cpf },
            select: ['id', 'cpf', 'email', 'passwordHash', 'role'],
        });
    }

    async findProfileById(userId: number): Promise<User | null> {
        return this.ormRepository.findOne({
            where: { id: userId },
            select: ['id', 'name', 'cpf', 'email', 'role', 'createdAt', 'updatedAt'],
        });
    }
}
