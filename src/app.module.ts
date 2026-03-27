import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CommentsModule } from './modules/comments/comments.module';
import { TicketsModule } from './modules/tickets/tickets.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            useFactory: (): TypeOrmModuleOptions => {
                if (process.env.DATABASE_URL) {
                    return {
                        type: 'postgres',
                        url: process.env.DATABASE_URL,
                        autoLoadEntities: true,
                        synchronize: false,
                    };
                }

                return {
                    type: 'sqlite',
                    database: 'ticketforge-local.sqlite',
                    autoLoadEntities: true,
                    synchronize: true,
                };
            },
        }),
        AuthModule,
        TicketsModule,
        CommentsModule,
    ],
})
export class AppModule {}
