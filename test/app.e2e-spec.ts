import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('TicketForge E2E', () => {
    let app: INestApplication;

    beforeAll(async () => {
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

        await request(app.getHttpServer())
            .get(`/api/v1/tickets/${ticketId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    });
});
