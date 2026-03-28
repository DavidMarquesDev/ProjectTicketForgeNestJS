import { ConflictException } from '@nestjs/common';
import { UserRole } from '../../entities/user.entity';
import { IUserRepository } from '../../repositories/user.repository.interface';
import { RegisterCommand } from './register.command';
import { RegisterHandler } from './register.handler';

describe('RegisterHandler', () => {
    it('deve cadastrar usuário com sucesso', async () => {
        const userRepository = {
            existsByEmail: jest.fn().mockResolvedValueOnce(false),
            existsByCpf: jest.fn().mockResolvedValueOnce(false),
            createAndSave: jest.fn().mockImplementation(async (input) => ({
                id: 1,
                role: UserRole.USER,
                ...input,
            })),
        } as unknown as IUserRepository;
        const handler = new RegisterHandler(userRepository);

        const result = await handler.execute(new RegisterCommand({
            name: 'User Test',
            cpf: '12345678901',
            email: 'user@email.com',
            password: '12345678',
        }));

        expect(result.success).toBe(true);
        expect(result.data.id).toBe(1);
        expect(userRepository.createAndSave).toHaveBeenCalled();
    });

    it('deve falhar quando e-mail já existir', async () => {
        const userRepository = {
            existsByEmail: jest.fn().mockResolvedValueOnce(true),
            existsByCpf: jest.fn(),
            createAndSave: jest.fn(),
        } as unknown as IUserRepository;
        const handler = new RegisterHandler(userRepository);

        await expect(handler.execute(new RegisterCommand({
            name: 'User Test',
            cpf: '12345678901',
            email: 'user@email.com',
            password: '12345678',
        }))).rejects.toThrow(ConflictException);
    });
});
