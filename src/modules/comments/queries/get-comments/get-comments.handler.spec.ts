import { GetCommentsQuery } from './get-comments.query';
import { GetCommentsHandler } from './get-comments.handler';

describe('GetCommentsHandler', () => {
    it('deve retornar comentários com sucesso', async () => {
        const commentRepository = {
            findByTicket: jest.fn().mockResolvedValue([
                {
                    id: 1,
                    ticketId: 1,
                    authorId: 1,
                    content: 'Comentário de teste',
                    createdAt: new Date(),
                },
            ]),
        };
        const handler = new GetCommentsHandler(commentRepository as never);

        const result = await handler.execute(new GetCommentsQuery(1));

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(commentRepository.findByTicket).toHaveBeenCalledWith(1);
    });
});
