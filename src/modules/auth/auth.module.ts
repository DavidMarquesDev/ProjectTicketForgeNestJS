import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { LoginHandler } from './commands/login/login.handler';
import { LogoutHandler } from './commands/logout/logout.handler';
import { RegisterHandler } from './commands/register/register.handler';
import { User } from './entities/user.entity';
import { GetMeHandler } from './queries/get-me/get-me.handler';
import { USER_REPOSITORY } from './repositories/user.repository.interface';
import { UserTypeOrmRepository } from './repositories/user.typeorm.repository';
import { JwtStrategy } from './strategies/jwt.strategy';

const commandHandlers = [LoginHandler, LogoutHandler, RegisterHandler];
const queryHandlers = [GetMeHandler];

@Module({
    imports: [
        CqrsModule,
        ConfigModule,
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.getOrThrow<string>('JWT_EXPIRES_IN'),
                },
            }),
        }),
        TypeOrmModule.forFeature([User]),
    ],
    controllers: [AuthController],
    providers: [
        JwtStrategy,
        UserTypeOrmRepository,
        {
            provide: USER_REPOSITORY,
            useExisting: UserTypeOrmRepository,
        },
        ...commandHandlers,
        ...queryHandlers,
    ],
    exports: [JwtModule, TypeOrmModule, USER_REPOSITORY],
})
export class AuthModule {}
