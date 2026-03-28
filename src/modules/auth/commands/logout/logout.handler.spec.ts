import { LogoutHandler } from './logout.handler';

describe('LogoutHandler', () => {
    it('deve retornar sucesso no logout', async () => {
        const handler = new LogoutHandler();

        const result = await handler.execute();

        expect(result).toEqual({ success: true });
    });
});
