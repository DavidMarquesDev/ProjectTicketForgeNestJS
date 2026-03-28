import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AuditTrailService } from '../../../audit/services/audit-trail.service';
import { CommentDeletedEvent } from '../contracts';

@EventsHandler(CommentDeletedEvent)
export class AuditCommentDeletedHandler implements IEventHandler<CommentDeletedEvent> {
    constructor(private readonly auditTrailService: AuditTrailService) {}

    async handle(event: CommentDeletedEvent): Promise<void> {
        await this.auditTrailService.record({
            action: 'comment_deleted',
            aggregateType: 'comment',
            aggregateId: event.commentId.toString(),
            actorId: event.deletedBy,
            metadata: {
                ticketId: event.ticketId,
            },
        });
    }
}
