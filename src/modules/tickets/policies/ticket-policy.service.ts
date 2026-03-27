import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '../../auth/entities/user.entity';
import { Ticket } from '../entities/ticket.entity';

@Injectable()
export class TicketPolicyService {
    assertCanAssign(actorRole: string): void {
        if (actorRole !== UserRole.ADMIN && actorRole !== UserRole.SUPPORT) {
            throw new ForbiddenException('Apenas suporte ou admin podem atribuir ticket');
        }
    }

    assertCanUpdateStatus(ticket: Ticket, actorId: number, actorRole: string): void {
        const isOwner = ticket.createdBy === actorId;
        const isAssignee = ticket.assignedTo === actorId;
        const isSupport = actorRole === UserRole.ADMIN || actorRole === UserRole.SUPPORT;

        if (!isOwner && !isAssignee && !isSupport) {
            throw new ForbiddenException('Usuário não possui permissão para atualizar status');
        }
    }
}
