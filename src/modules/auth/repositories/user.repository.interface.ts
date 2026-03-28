import { User, UserRole } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type CreateUserInput = {
    name: string;
    cpf: string;
    email: string;
    passwordHash: string;
    role: UserRole;
};

export interface IUserRepository {
    existsByEmail(email: string): Promise<boolean>;
    existsByCpf(cpf: string): Promise<boolean>;
    createAndSave(input: CreateUserInput): Promise<User>;
    findAuthByCpf(cpf: string): Promise<User | null>;
    findProfileById(userId: number): Promise<User | null>;
}
