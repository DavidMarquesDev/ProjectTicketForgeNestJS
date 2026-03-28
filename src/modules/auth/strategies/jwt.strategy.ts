import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUserRepository, USER_REPOSITORY } from '../repositories/user.repository.interface';

type JwtPayload = {
    sub: number;
    email: string;
    role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload): Promise<{ id: number; email: string; role: string }> {
        const user = await this.userRepository.findProfileById(payload.sub);
        if (!user) {
            throw new UnauthorizedException('Usuário autenticado não encontrado');
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role,
        };
    }
}
