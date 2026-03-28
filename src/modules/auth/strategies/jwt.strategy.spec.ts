import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user.repository.interface';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
    it('deve validar payload quando usuário existir', async () => {
        const configService = {
            getOrThrow: jest.fn().mockReturnValue('secret'),
        } as unknown as ConfigService;
        const userRepository = {
            findProfileById: jest.fn().mockResolvedValue({
                id: 5,
                email: 'user@email.com',
                role: UserRole.USER,
            }),
        } as unknown as IUserRepository;

        const strategy = new JwtStrategy(configService, userRepository);

        const result = await strategy.validate({
            sub: 5,
            email: 'user@email.com',
            role: UserRole.USER,
        });

        expect(result).toEqual({
            id: 5,
            email: 'user@email.com',
            role: UserRole.USER,
        });
        expect(userRepository.findProfileById).toHaveBeenCalledWith(5);
    });

    it('deve lançar unauthorized quando usuário não existir', async () => {
        const configService = {
            getOrThrow: jest.fn().mockReturnValue('secret'),
        } as unknown as ConfigService;
        const userRepository = {
            findProfileById: jest.fn().mockResolvedValue(null),
        } as unknown as IUserRepository;

        const strategy = new JwtStrategy(configService, userRepository);

        await expect(
            strategy.validate({
                sub: 999,
                email: 'ghost@email.com',
                role: UserRole.USER,
            }),
        ).rejects.toThrow(UnauthorizedException);
    });
});
