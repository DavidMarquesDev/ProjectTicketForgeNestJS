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

const validateNotificationConfiguration = (environment: Record<string, unknown>): void => {
    const webhookUrl = environment.NOTIFICATION_WEBHOOK_URL;
    const webhookTimeoutMs = environment.NOTIFICATION_WEBHOOK_TIMEOUT_MS;

    if (typeof webhookUrl === 'string' && webhookUrl.trim().length > 0) {
        try {
            const parsedWebhookUrl = new URL(webhookUrl);
            const isHttpProtocol = parsedWebhookUrl.protocol === 'http:' || parsedWebhookUrl.protocol === 'https:';
            if (!isHttpProtocol) {
                throw new Error('NOTIFICATION_WEBHOOK_URL must use http or https protocol');
            }
        } catch (error) {
            throw new Error(
                `Invalid NOTIFICATION_WEBHOOK_URL: ${error instanceof Error ? error.message : 'malformed URL'}`,
            );
        }
    }

    if (typeof webhookTimeoutMs === 'string' && webhookTimeoutMs.trim().length > 0) {
        const timeout = Number(webhookTimeoutMs);
        const isValidTimeout = Number.isInteger(timeout) && timeout >= 500 && timeout <= 60000;
        if (!isValidTimeout) {
            throw new Error('Invalid NOTIFICATION_WEBHOOK_TIMEOUT_MS: expected integer between 500 and 60000');
        }
    }
};

const parseBooleanEnvironmentVariable = (
    environment: Record<string, unknown>,
    key: string,
): boolean | undefined => {
    const value = environment[key];
    if (typeof value !== 'string' || value.trim().length === 0) {
        return undefined;
    }

    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === 'true') {
        return true;
    }

    if (normalizedValue === 'false') {
        return false;
    }

    throw new Error(`Invalid ${key}: expected true or false`);
};

const parseIntegerEnvironmentVariable = (
    environment: Record<string, unknown>,
    key: string,
): number | undefined => {
    const value = environment[key];
    if (typeof value !== 'string' || value.trim().length === 0) {
        return undefined;
    }

    const parsedValue = Number(value);
    if (!Number.isInteger(parsedValue)) {
        throw new Error(`Invalid ${key}: expected integer value`);
    }

    return parsedValue;
};

const validateAsyncQueueConfiguration = (
    environment: Record<string, unknown>,
    nodeEnvironment: string,
): void => {
    const isAsyncQueueEnabled = parseBooleanEnvironmentVariable(environment, 'ASYNC_QUEUE_ENABLED');
    const redisPort = parseIntegerEnvironmentVariable(environment, 'REDIS_PORT');
    const areNotificationEventsEnabled = parseBooleanEnvironmentVariable(environment, 'NOTIFICATION_EVENTS_ENABLED');

    if (redisPort !== undefined && (redisPort < 1 || redisPort > 65535)) {
        throw new Error('Invalid REDIS_PORT: expected integer between 1 and 65535');
    }

    if (isAsyncQueueEnabled !== true) {
        return;
    }

    if (isMissingEnvironmentVariable(environment, 'REDIS_HOST')) {
        throw new Error('Missing required environment variables: REDIS_HOST');
    }

    if (redisPort === undefined) {
        throw new Error('Missing required environment variables: REDIS_PORT');
    }

    const shouldRequireNotificationEvents = areNotificationEventsEnabled ?? true;
    const shouldRequireWebhook = shouldRequireNotificationEvents
        && doesNodeEnvironmentRequireDatabaseUrl(nodeEnvironment);
    if (shouldRequireWebhook && isMissingEnvironmentVariable(environment, 'NOTIFICATION_WEBHOOK_URL')) {
        throw new Error('Missing required environment variables: NOTIFICATION_WEBHOOK_URL');
    }
};

export const validateEnvironment = (environment: Record<string, unknown>): Record<string, unknown> => {
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

    validateNotificationConfiguration(environment);
    validateAsyncQueueConfiguration(environment, currentNodeEnvironment);

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
