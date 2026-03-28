import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../auth/entities/user.entity';
import { CommentPolicyService } from './comment-policy.service';

describe('CommentPolicyService', () => {
    const comment = {
        id: 10,
        ticketId: 15,
        authorId: 99,
    };

    it('deve permitir atualização para autor', () => {
        const service = new CommentPolicyService();

        expect(() => service.assertCanUpdate(comment as never, 99, UserRole.USER)).not.toThrow();
    });

    it('deve permitir atualização para admin', () => {
        const service = new CommentPolicyService();

        expect(() => service.assertCanUpdate(comment as never, 100, UserRole.ADMIN)).not.toThrow();
    });

    it('deve negar atualização para usuário sem permissão', () => {
        const service = new CommentPolicyService();

        expect(() => service.assertCanUpdate(comment as never, 100, UserRole.SUPPORT)).toThrow(ForbiddenException);
    });

    it('deve permitir exclusão para autor', () => {
        const service = new CommentPolicyService();

        expect(() => service.assertCanDelete(comment as never, 99, UserRole.USER)).not.toThrow();
    });

    it('deve permitir exclusão para admin', () => {
        const service = new CommentPolicyService();

        expect(() => service.assertCanDelete(comment as never, 100, UserRole.ADMIN)).not.toThrow();
    });

    it('deve negar exclusão para usuário sem permissão', () => {
        const service = new CommentPolicyService();

        expect(() => service.assertCanDelete(comment as never, 100, UserRole.SUPPORT)).toThrow(ForbiddenException);
    });
});

