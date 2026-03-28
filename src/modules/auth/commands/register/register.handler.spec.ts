import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { RegisterCommand } from './register.command';
import { RegisterHandler } from './register.handler';

describe('RegisterHandler', () => {
    it('deve cadastrar usuário com sucesso', async () => {
        const userRepository = {
            exists: jest.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(false),
            create: jest.fn().mockImplementation((input) => input),
            save: jest.fn().mockImplementation(async (input) => ({
                id: 1,
                role: UserRole.USER,
                ...input,
            })),
        } as unknown as Repository<User>;
        const handler = new RegisterHandler(userRepository);

        const result = await handler.execute(
            new RegisterCommand('User Test', '12345678901', 'user@email.com', '12345678'),
        );

        expect(result.success).toBe(true);
        expect(result.data.id).toBe(1);
        expect(result.data.cpf).toBe('12345678901');
        expect(userRepository.save).toHaveBeenCalled();
    });

    it('deve falhar quando e-mail já existir', async () => {
        const userRepository = {
            exists: jest.fn().mockResolvedValueOnce(true),
            create: jest.fn(),
            save: jest.fn(),
        } as unknown as Repository<User>;
        const handler = new RegisterHandler(userRepository);

        await expect(
            handler.execute(new RegisterCommand('User Test', '12345678901', 'user@email.com', '12345678')),
        ).rejects.toThrow(ConflictException);
    });
});
