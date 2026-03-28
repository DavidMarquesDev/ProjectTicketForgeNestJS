import { GetCommentsQuery } from './get-comments.query';
import { GetCommentsHandler } from './get-comments.handler';
import { CommentSortOrder } from '../../repositories/comment.repository.interface';

describe('GetCommentsHandler', () => {
    it('deve retornar comentários com sucesso', async () => {
        const commentRepository = {
            paginateByTicket: jest.fn().mockResolvedValue({
                data: [
                    {
                        id: 1,
                        ticketId: 1,
                        authorId: 1,
                        content: 'Comentário de teste',
                        createdAt: new Date(),
                    },
                ],
                total: 1,
                page: 1,
                limit: 20,
                totalPages: 1,
            }),
        };
        const handler = new GetCommentsHandler(commentRepository as never);

        const result = await handler.execute(
            new GetCommentsQuery({
                ticketId: 1,
                page: 1,
                limit: 20,
                order: CommentSortOrder.DESC,
            }),
        );

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.meta.total).toBe(1);
        expect(commentRepository.paginateByTicket).toHaveBeenCalledWith({
            ticketId: 1,
            page: 1,
            limit: 20,
            order: CommentSortOrder.DESC,
        });
    });
});
