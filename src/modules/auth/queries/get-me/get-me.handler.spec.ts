import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
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
            findOne: jest.fn().mockResolvedValue(user),
        } as unknown as Repository<User>;
        const handler = new GetMeHandler(userRepository);

        const result = await handler.execute(new GetMeQuery(1));

        expect(result.id).toBe(1);
        expect(userRepository.findOne).toHaveBeenCalled();
    });

    it('deve lançar not found para usuário inexistente', async () => {
        const userRepository = {
            findOne: jest.fn().mockResolvedValue(null),
        } as unknown as Repository<User>;
        const handler = new GetMeHandler(userRepository);

        await expect(handler.execute(new GetMeQuery(999))).rejects.toThrow(NotFoundException);
    });
});
