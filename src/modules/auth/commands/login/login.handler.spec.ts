import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { LoginCommand } from './login.command';
import { LoginHandler } from './login.handler';

describe('LoginHandler', () => {
    it('deve autenticar com credenciais válidas', async () => {
        const passwordHash = await hash('12345678', 10);
        const user = {
            id: 10,
            cpf: '12345678901',
            email: 'user@email.com',
            passwordHash,
            role: UserRole.USER,
        } as User;
        const userRepository = {
            findOne: jest.fn().mockResolvedValue(user),
        } as unknown as Repository<User>;
        const jwtService = {
            sign: jest.fn().mockReturnValue('jwt-token'),
        } as unknown as JwtService;
        const handler = new LoginHandler(userRepository, jwtService);

        const result = await handler.execute(new LoginCommand('12345678901', '12345678'));

        expect(result).toEqual({ success: true, token: 'jwt-token' });
        expect(jwtService.sign).toHaveBeenCalledWith({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
    });

    it('deve lançar erro para usuário inexistente', async () => {
        const userRepository = {
            findOne: jest.fn().mockResolvedValue(null),
        } as unknown as Repository<User>;
        const jwtService = {
            sign: jest.fn(),
        } as unknown as JwtService;
        const handler = new LoginHandler(userRepository, jwtService);

        await expect(handler.execute(new LoginCommand('12345678901', '12345678'))).rejects.toThrow(
            UnauthorizedException,
        );
    });
});
