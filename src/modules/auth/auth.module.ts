import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { LoginHandler } from './commands/login/login.handler';
import { LogoutHandler } from './commands/logout/logout.handler';
import { User } from './entities/user.entity';
import { GetMeHandler } from './queries/get-me/get-me.handler';
import { JwtStrategy } from './strategies/jwt.strategy';

const commandHandlers = [LoginHandler, LogoutHandler];
const queryHandlers = [GetMeHandler];

@Module({
    imports: [
        CqrsModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET ?? 'dev-secret',
            signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
        }),
        TypeOrmModule.forFeature([User]),
    ],
    controllers: [AuthController],
    providers: [JwtStrategy, ...commandHandlers, ...queryHandlers],
    exports: [JwtModule, TypeOrmModule],
})
export class AuthModule {}
