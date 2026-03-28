import { NotFoundException } from '@nestjs/common';
import { User, UserRole } from '../../entities/user.entity';
import { IUserRepository } from '../../repositories/user.repository.interface';
import { GetMeQuery } from './get-me.query';
import { GetMeHandler } from './get-me.handler';

describe('GetMeHandler', () => {
    it('deve retornar usuário autenticado', async () => {
        const user = {
            id: 1,
            name: 'User Test',
            cpf: '12345678901',
            email: 'user@email.com',
            role: UserRole.USER,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as User;
        const userRepository = {
            findProfileById: jest.fn().mockResolvedValue(user),
        } as unknown as IUserRepository;
        const handler = new GetMeHandler(userRepository);

        const result = await handler.execute(new GetMeQuery(1));

        expect(result.id).toBe(1);
        expect(userRepository.findProfileById).toHaveBeenCalled();
    });

    it('deve lançar not found para usuário inexistente', async () => {
        const userRepository = {
            findProfileById: jest.fn().mockResolvedValue(null),
        } as unknown as IUserRepository;
        const handler = new GetMeHandler(userRepository);

        await expect(handler.execute(new GetMeQuery(999))).rejects.toThrow(NotFoundException);
    });
});
