import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '../../auth/entities/user.entity';
import { Ticket } from '../entities/ticket.entity';

@Injectable()
export class TicketPolicyService {
    /**
     * Validates whether actor role can assign tickets.
     *
     * @param actorRole Role of current actor.
     * @throws ForbiddenException When actor role is not allowed to assign.
     */
    assertCanAssign(actorRole: string): void {
        if (actorRole !== UserRole.ADMIN && actorRole !== UserRole.SUPPORT) {
            throw new ForbiddenException('Apenas suporte ou admin podem atribuir ticket');
        }
    }

    /**
     * Validates whether actor can update ticket status.
     *
     * @param ticket Current ticket aggregate.
     * @param actorId Identifier of current actor.
     * @param actorRole Role of current actor.
     * @throws ForbiddenException When actor has no permission to update.
     */
    assertCanUpdateStatus(ticket: Ticket, actorId: number, actorRole: string): void {
        const isOwner = ticket.createdBy === actorId;
        const isAssignee = ticket.assignedTo === actorId;
        const isSupport = actorRole === UserRole.ADMIN || actorRole === UserRole.SUPPORT;

        if (!isOwner && !isAssignee && !isSupport) {
            throw new ForbiddenException('Usuário não possui permissão para atualizar status');
        }
    }
}
