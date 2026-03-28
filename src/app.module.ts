import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AsyncProcessingModule } from './modules/async-processing/async-processing.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommentsModule } from './modules/comments/comments.module';
import { OutboxModule } from './modules/outbox/outbox.module';
import { TicketsModule } from './modules/tickets/tickets.module';

const asyncQueueModules = process.env.ASYNC_QUEUE_ENABLED === 'true' ? [AsyncProcessingModule] : [];

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 20,
            },
        ]),
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
        OutboxModule,
        ...asyncQueueModules,
    ],
})
export class AppModule {}
