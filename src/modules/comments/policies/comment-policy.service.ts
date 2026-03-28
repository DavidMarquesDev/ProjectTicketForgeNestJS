import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '../../auth/entities/user.entity';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentPolicyService {
    /**
     * Validates whether actor can update a comment.
     *
     * @param comment Current comment aggregate.
     * @param actorId Identifier of current actor.
     * @param actorRole Role of current actor.
     * @throws ForbiddenException When actor has no permission to update.
     */
    assertCanUpdate(comment: Comment, actorId: number, actorRole: string): void {
        const canUpdate = comment.authorId === actorId || actorRole === UserRole.ADMIN;
        if (!canUpdate) {
            throw new ForbiddenException('Usuário não possui permissão para editar comentário');
        }
    }

    /**
     * Validates whether actor can delete a comment.
     *
     * @param comment Current comment aggregate.
     * @param actorId Identifier of current actor.
     * @param actorRole Role of current actor.
     * @throws ForbiddenException When actor has no permission to delete.
     */
    assertCanDelete(comment: Comment, actorId: number, actorRole: string): void {
        const canDelete = comment.authorId === actorId || actorRole === UserRole.ADMIN;
        if (!canDelete) {
            throw new ForbiddenException('Usuário não possui permissão para excluir comentário');
        }
    }
}

