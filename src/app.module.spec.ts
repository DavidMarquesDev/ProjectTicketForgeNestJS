import { validateEnvironment } from './app.module';

describe('validateEnvironment', () => {
    const baseEnvironment = {
        JWT_SECRET: 'secret',
        JWT_EXPIRES_IN: '1h',
        NODE_ENV: 'development',
    };

    it('deve aceitar configuração válida sem webhook', () => {
        expect(validateEnvironment(baseEnvironment)).toEqual(baseEnvironment);
    });

    it('deve falhar quando NOTIFICATION_WEBHOOK_URL for inválida', () => {
        expect(() =>
            validateEnvironment({
                ...baseEnvironment,
                NOTIFICATION_WEBHOOK_URL: 'url-invalida',
            }),
        ).toThrow('Invalid NOTIFICATION_WEBHOOK_URL');
    });

    it('deve falhar quando NOTIFICATION_WEBHOOK_URL usar protocolo inválido', () => {
        expect(() =>
            validateEnvironment({
                ...baseEnvironment,
                NOTIFICATION_WEBHOOK_URL: 'ftp://host.test/webhook',
            }),
        ).toThrow('Invalid NOTIFICATION_WEBHOOK_URL');
    });

    it('deve falhar quando NOTIFICATION_WEBHOOK_TIMEOUT_MS for inválido', () => {
        expect(() =>
            validateEnvironment({
                ...baseEnvironment,
                NOTIFICATION_WEBHOOK_TIMEOUT_MS: 'abc',
            }),
        ).toThrow('Invalid NOTIFICATION_WEBHOOK_TIMEOUT_MS');
    });

    it('deve aceitar timeout dentro do intervalo permitido', () => {
        expect(
            validateEnvironment({
                ...baseEnvironment,
                NOTIFICATION_WEBHOOK_TIMEOUT_MS: '5000',
            }),
        ).toEqual({
            ...baseEnvironment,
            NOTIFICATION_WEBHOOK_TIMEOUT_MS: '5000',
        });
    });

    it('deve falhar quando ASYNC_QUEUE_ENABLED tiver valor inválido', () => {
        expect(() =>
            validateEnvironment({
                ...baseEnvironment,
                ASYNC_QUEUE_ENABLED: 'enabled',
            }),
        ).toThrow('Invalid ASYNC_QUEUE_ENABLED');
    });

    it('deve falhar quando fila assíncrona estiver habilitada sem REDIS_HOST', () => {
        expect(() =>
            validateEnvironment({
                ...baseEnvironment,
                ASYNC_QUEUE_ENABLED: 'true',
                REDIS_PORT: '6379',
                NOTIFICATION_WEBHOOK_URL: 'https://webhook.local/notify',
            }),
        ).toThrow('Missing required environment variables: REDIS_HOST');
    });

    it('deve falhar quando fila assíncrona estiver habilitada sem REDIS_PORT', () => {
        expect(() =>
            validateEnvironment({
                ...baseEnvironment,
                ASYNC_QUEUE_ENABLED: 'true',
                REDIS_HOST: '127.0.0.1',
                NOTIFICATION_WEBHOOK_URL: 'https://webhook.local/notify',
            }),
        ).toThrow('Missing required environment variables: REDIS_PORT');
    });

    it('deve falhar quando REDIS_PORT for inválida', () => {
        expect(() =>
            validateEnvironment({
                ...baseEnvironment,
                ASYNC_QUEUE_ENABLED: 'true',
                REDIS_HOST: '127.0.0.1',
                REDIS_PORT: '70000',
                NOTIFICATION_WEBHOOK_URL: 'https://webhook.local/notify',
            }),
        ).toThrow('Invalid REDIS_PORT');
    });

    it('deve falhar em produção quando fila assíncrona com notificações habilitadas estiver sem webhook', () => {
        expect(() =>
            validateEnvironment({
                ...baseEnvironment,
                NODE_ENV: 'production',
                DATABASE_URL: 'postgres://user:pass@localhost:5432/ticketforge',
                ASYNC_QUEUE_ENABLED: 'true',
                REDIS_HOST: '127.0.0.1',
                REDIS_PORT: '6379',
            }),
        ).toThrow('Missing required environment variables: NOTIFICATION_WEBHOOK_URL');
    });

    it('deve aceitar em desenvolvimento fila assíncrona sem webhook', () => {
        expect(
            validateEnvironment({
                ...baseEnvironment,
                ASYNC_QUEUE_ENABLED: 'true',
                REDIS_HOST: '127.0.0.1',
                REDIS_PORT: '6379',
            }),
        ).toEqual({
            ...baseEnvironment,
            ASYNC_QUEUE_ENABLED: 'true',
            REDIS_HOST: '127.0.0.1',
            REDIS_PORT: '6379',
        });
    });

    it('deve aceitar configuração válida de fila assíncrona', () => {
        expect(
            validateEnvironment({
                ...baseEnvironment,
                ASYNC_QUEUE_ENABLED: 'true',
                REDIS_HOST: '127.0.0.1',
                REDIS_PORT: '6379',
                NOTIFICATION_WEBHOOK_URL: 'https://webhook.local/notify',
            }),
        ).toEqual({
            ...baseEnvironment,
            ASYNC_QUEUE_ENABLED: 'true',
            REDIS_HOST: '127.0.0.1',
            REDIS_PORT: '6379',
            NOTIFICATION_WEBHOOK_URL: 'https://webhook.local/notify',
        });
    });

    it('deve aceitar fila assíncrona sem webhook quando NOTIFICATION_EVENTS_ENABLED for false', () => {
        expect(
            validateEnvironment({
                ...baseEnvironment,
                ASYNC_QUEUE_ENABLED: 'true',
                NOTIFICATION_EVENTS_ENABLED: 'false',
                REDIS_HOST: '127.0.0.1',
                REDIS_PORT: '6379',
            }),
        ).toEqual({
            ...baseEnvironment,
            ASYNC_QUEUE_ENABLED: 'true',
            NOTIFICATION_EVENTS_ENABLED: 'false',
            REDIS_HOST: '127.0.0.1',
            REDIS_PORT: '6379',
        });
    });
});
