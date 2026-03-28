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
const requiredEnvironmentVariables = ['JWT_SECRET', 'JWT_EXPIRES_IN'] as const;
const localNodeEnvironments = ['development', 'test', 'local'] as const;
const databaseUrlRequiredNodeEnvironments = [
    'production',
    'staging',
    'homolog',
    'hml',
    'qa',
    'uat',
] as const;

const isMissingEnvironmentVariable = (environment: Record<string, unknown>, key: string): boolean => {
    const value = environment[key];
    return typeof value !== 'string' || value.trim().length === 0;
};

const normalizeNodeEnvironment = (nodeEnvironment: unknown): string => {
    return typeof nodeEnvironment === 'string' ? nodeEnvironment.trim().toLowerCase() : 'development';
};

const doesNodeEnvironmentRequireDatabaseUrl = (nodeEnvironment: string): boolean => {
    return databaseUrlRequiredNodeEnvironments.includes(
        nodeEnvironment as (typeof databaseUrlRequiredNodeEnvironments)[number],
    );
};

const validateEnvironment = (environment: Record<string, unknown>): Record<string, unknown> => {
    const missingVariables = requiredEnvironmentVariables.filter((variable) => {
        return isMissingEnvironmentVariable(environment, variable);
    });

    if (missingVariables.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVariables.join(', ')}`,
        );
    }

    const currentNodeEnvironment = normalizeNodeEnvironment(environment.NODE_ENV);

    if (
        doesNodeEnvironmentRequireDatabaseUrl(currentNodeEnvironment)
        && isMissingEnvironmentVariable(environment, 'DATABASE_URL')
    ) {
        throw new Error('Missing required environment variables: DATABASE_URL');
    }

    return environment;
};

const isLocalNodeEnvironment = (): boolean => {
    const currentNodeEnvironment = normalizeNodeEnvironment(process.env.NODE_ENV);
    return localNodeEnvironments.includes(currentNodeEnvironment as (typeof localNodeEnvironments)[number]);
};

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
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

                if (!isLocalNodeEnvironment()) {
                    throw new Error('DATABASE_URL is required when NODE_ENV is not local/development/test');
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
