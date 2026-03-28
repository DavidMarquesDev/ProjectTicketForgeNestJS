import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AuditTrailService } from '../../../audit/services/audit-trail.service';
import { CommentUpdatedEvent } from '../contracts';

@EventsHandler(CommentUpdatedEvent)
export class AuditCommentUpdatedHandler implements IEventHandler<CommentUpdatedEvent> {
    constructor(private readonly auditTrailService: AuditTrailService) {}

    async handle(event: CommentUpdatedEvent): Promise<void> {
        await this.auditTrailService.record({
            action: 'comment_updated',
            aggregateType: 'comment',
            aggregateId: event.commentId.toString(),
            actorId: event.updatedBy,
            metadata: {
                ticketId: event.ticketId,
            },
        });
    }
}
