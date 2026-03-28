import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import redoc from 'redoc-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';

/**
 * Boots the HTTP application with global API configuration.
 *
 * @returns Promise resolved when HTTP server is listening.
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.use((request: Request, response: Response, next: NextFunction) => {
        const requestId = request.headers['x-request-id']?.toString() ?? randomUUID();
        request.headers['x-request-id'] = requestId;
        response.setHeader('x-request-id', requestId);
        next();
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
