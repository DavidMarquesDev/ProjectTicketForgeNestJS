import { BadRequestException } from '@nestjs/common';
import { IdempotencyService } from './idempotency.service';

describe('IdempotencyService', () => {
    it('deve executar ação sem persistir quando chave não for enviada', async () => {
        const repository = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };
        const service = new IdempotencyService(repository as never);
        const action = jest.fn().mockResolvedValue({ id: 1, success: true });

        const result = await service.execute({
            scope: 'tickets:create',
            actorId: 10,
            action,
        });

        expect(result).toEqual({ id: 1, success: true });
        expect(action).toHaveBeenCalledTimes(1);
        expect(repository.findOne).not.toHaveBeenCalled();
        expect(repository.save).not.toHaveBeenCalled();
    });

    it('deve retornar cache quando chave já existir', async () => {
        const repository = {
            findOne: jest.fn().mockResolvedValue({
                responsePayload: JSON.stringify({ id: 99, success: true }),
            }),
            create: jest.fn(),
            save: jest.fn(),
        };
        const service = new IdempotencyService(repository as never);
        const action = jest.fn();

        const result = await service.execute({
            scope: 'tickets:create',
            actorId: 10,
            key: 'abc-123',
            action,
        });

        expect(result).toEqual({ id: 99, success: true });
        expect(action).not.toHaveBeenCalled();
        expect(repository.save).not.toHaveBeenCalled();
    });

    it('deve persistir resposta quando chave for nova', async () => {
        const entity = {
            scope: 'tickets:create',
            actorId: 10,
            key: 'abc-123',
            responsePayload: JSON.stringify({ id: 30, success: true }),
        };
        const repository = {
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockReturnValue(entity),
            save: jest.fn().mockResolvedValue(entity),
        };
        const service = new IdempotencyService(repository as never);
        const action = jest.fn().mockResolvedValue({ id: 30, success: true });

        const result = await service.execute({
            scope: 'tickets:create',
            actorId: 10,
            key: 'abc-123',
            action,
        });

        expect(result).toEqual({ id: 30, success: true });
        expect(repository.create).toHaveBeenCalledWith(entity);
        expect(repository.save).toHaveBeenCalledWith(entity);
    });

    it('deve lançar bad request quando chave exceder 120 caracteres', async () => {
        const repository = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };
        const service = new IdempotencyService(repository as never);
        const action = jest.fn();

        await expect(
            service.execute({
                scope: 'tickets:create',
                actorId: 10,
                key: 'a'.repeat(121),
                action,
            }),
        ).rejects.toThrow(BadRequestException);
    });
});

