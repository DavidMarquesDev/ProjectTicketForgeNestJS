import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { SuccessResponseInterceptor } from '../src/common/interceptors/success-response.interceptor';

describe('TicketForge E2E', () => {
    let app: INestApplication;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        process.env.JWT_SECRET = 'ticketforge-e2e-secret';
        process.env.DATABASE_URL = '';
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
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
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('deve executar fluxo auth + tickets + comments', async () => {
        const suffix = Date.now().toString();
        const cpf = `12345${suffix.slice(-6)}`;
        const registerPayload = {
            name: 'E2E User',
            cpf,
            email: `e2e.${suffix}@mail.com`,
            password: '12345678',
        };

        await request(app.getHttpServer()).post('/api/v1/auth/register').send(registerPayload).expect(201);

        const loginResponse = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
                cpf: registerPayload.cpf,
                password: registerPayload.password,
            })
            .expect(201);

        expect(loginResponse.body.success).toBe(true);
        expect(typeof loginResponse.body.token).toBe('string');

        const token = loginResponse.body.token as string;

        await request(app.getHttpServer())
            .get('/api/v1/auth/me')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const createTicketResponse = await request(app.getHttpServer())
            .post('/api/v1/tickets')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Ticket E2E',
                description: 'Descrição de ticket para teste e2e',
            })
            .expect(201);

        expect(createTicketResponse.body.success).toBe(true);
        const ticketId = createTicketResponse.body.id as number;

        await request(app.getHttpServer())
            .get('/api/v1/tickets')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        await request(app.getHttpServer())
            .get(`/api/v1/tickets/${ticketId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        await request(app.getHttpServer())
            .post(`/api/v1/tickets/${ticketId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Comentário e2e' })
            .expect(201);

        const createCommentResponse = await request(app.getHttpServer())
            .post(`/api/v1/tickets/${ticketId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Comentário para edição e2e' })
            .expect(201);

        const commentId = createCommentResponse.body.id as number;

        const updateOwnCommentResponse = await request(app.getHttpServer())
            .patch(`/api/v1/tickets/${ticketId}/comments/${commentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Comentário atualizado pelo autor' })
            .expect(200);

        expect(updateOwnCommentResponse.body.success).toBe(true);
        expect(updateOwnCommentResponse.body.id).toBe(commentId);

        const deleteOwnCommentResponse = await request(app.getHttpServer())
            .delete(`/api/v1/tickets/${ticketId}/comments/${commentId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(deleteOwnCommentResponse.body.success).toBe(true);
        expect(deleteOwnCommentResponse.body.id).toBe(commentId);

        const createForbiddenDeleteCommentResponse = await request(app.getHttpServer())
            .post(`/api/v1/tickets/${ticketId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Comentário para validar exclusão sem autoria' })
            .expect(201);

        const forbiddenDeleteCommentId = createForbiddenDeleteCommentResponse.body.id as number;

        const listCommentsResponse = await request(app.getHttpServer())
            .get(`/api/v1/tickets/${ticketId}/comments?page=1&limit=10&order=DESC`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(listCommentsResponse.body.success).toBe(true);
        expect(Array.isArray(listCommentsResponse.body.data)).toBe(true);
        expect(listCommentsResponse.body.meta.page).toBe(1);
        expect(listCommentsResponse.body.meta.limit).toBe(10);

        const invalidTransitionResponse = await request(app.getHttpServer())
            .patch(`/api/v1/tickets/${ticketId}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'closed' })
            .expect(409);

        expect(invalidTransitionResponse.body.success).toBe(false);
        expect(invalidTransitionResponse.body.code).toBe('CONFLICT');

        const forbiddenAssignResponse = await request(app.getHttpServer())
            .patch(`/api/v1/tickets/${ticketId}/assign`)
            .set('Authorization', `Bearer ${token}`)
            .send({ userId: 9999 })
            .expect(403);

        expect(forbiddenAssignResponse.body.success).toBe(false);
        expect(forbiddenAssignResponse.body.code).toBe('FORBIDDEN');

        const outsiderSuffix = `${Date.now() + 10}`;
        const outsiderPayload = {
            name: 'E2E Outsider',
            cpf: `54321${outsiderSuffix.slice(-6)}`,
            email: `e2e.outsider.${outsiderSuffix}@mail.com`,
            password: '12345678',
        };

        await request(app.getHttpServer()).post('/api/v1/auth/register').send(outsiderPayload).expect(201);

        const outsiderLoginResponse = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
                cpf: outsiderPayload.cpf,
                password: outsiderPayload.password,
            })
            .expect(201);

        const outsiderToken = outsiderLoginResponse.body.token as string;

        const forbiddenUpdateCommentResponse = await request(app.getHttpServer())
            .patch(`/api/v1/tickets/${ticketId}/comments/${forbiddenDeleteCommentId}`)
            .set('Authorization', `Bearer ${outsiderToken}`)
            .send({ content: 'Tentativa de edição sem autoria' })
            .expect(403);

        expect(forbiddenUpdateCommentResponse.body.success).toBe(false);
        expect(forbiddenUpdateCommentResponse.body.code).toBe('FORBIDDEN');

        const forbiddenDeleteCommentResponse = await request(app.getHttpServer())
            .delete(`/api/v1/tickets/${ticketId}/comments/${forbiddenDeleteCommentId}`)
            .set('Authorization', `Bearer ${outsiderToken}`)
            .expect(403);

        expect(forbiddenDeleteCommentResponse.body.success).toBe(false);
        expect(forbiddenDeleteCommentResponse.body.code).toBe('FORBIDDEN');
    });
});
