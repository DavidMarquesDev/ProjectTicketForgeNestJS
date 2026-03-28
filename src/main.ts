import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import redoc from 'redoc-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';
import { OperationalMetricsService } from './common/observability/operational-metrics.service';
import { TraceContextStore } from './common/observability/trace-context.store';

/**
 * Boots the HTTP application with global API configuration.
 *
 * @returns Promise resolved when HTTP server is listening.
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const operationalMetricsService = app.get(OperationalMetricsService);
    const currentNodeEnvironment = configService.get<string>('NODE_ENV')?.trim().toLowerCase() ?? 'development';
    const corsAllowedOrigins = configService.get<string>('CORS_ALLOWED_ORIGINS');
    const isProductionLikeEnvironment = ['production', 'staging', 'homolog', 'hml', 'qa', 'uat']
        .includes(currentNodeEnvironment);
    const parsedCorsOrigins = corsAllowedOrigins
        ?.split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0) ?? [];

    app.enableCors({
        origin: isProductionLikeEnvironment ? parsedCorsOrigins : true,
        credentials: true,
    });
    app.use((request: Request, response: Response, next: NextFunction) => {
        const requestId = request.headers['x-request-id']?.toString() ?? randomUUID();
        const traceId = request.headers['x-trace-id']?.toString() ?? requestId;
        request.headers['x-request-id'] = requestId;
        request.headers['x-trace-id'] = traceId;
        response.setHeader('x-request-id', requestId);
        response.setHeader('x-trace-id', traceId);

        TraceContextStore.run({ traceId, requestId }, () => {
            const start = process.hrtime.bigint();
            response.on('finish', () => {
                const routePath = (request as Request & { route?: { path?: string } }).route?.path ?? request.path;
                const route = `${request.baseUrl}${routePath}` || request.originalUrl;
                const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
                operationalMetricsService.recordHttpRequest(
                    request.method,
                    route,
                    response.statusCode,
                    Number(durationMs.toFixed(2)),
                );
            });
            next();
        });
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new SuccessResponseInterceptor());

    const config = new DocumentBuilder()
        .setTitle('TicketForge API')
        .setDescription('API de tickets com arquitetura CQRS em NestJS')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs/api', app, document);
    app.use(
        '/docs/redoc',
        redoc({
            title: 'TicketForge API Docs',
            specUrl: '/docs/api-json',
        }),
    );

    await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}

void bootstrap();
