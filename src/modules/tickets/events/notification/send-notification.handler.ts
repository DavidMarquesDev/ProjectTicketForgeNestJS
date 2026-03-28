import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { toStructuredLog } from '../../../../common/logging/structured-log.helper';
import { OutboxService } from '../../../outbox/outbox.service';
import { TicketCreatedEvent } from '../contracts';

@EventsHandler(TicketCreatedEvent)
export class SendNotificationHandler implements IEventHandler<TicketCreatedEvent> {
    private readonly logger = new Logger(SendNotificationHandler.name);

    constructor(private readonly outboxService: OutboxService) {}

    async handle(event: TicketCreatedEvent): Promise<void> {
        await this.outboxService.createPendingEvent({
            eventName: 'TicketNotificationRequestedEvent',
            aggregateType: 'notification',
            aggregateId: event.ticketId.toString(),
            payload: {
                ticketId: event.ticketId,
                createdBy: event.createdBy,
            },
        });

        this.logger.log(
            toStructuredLog({
                level: 'info',
                action: 'ticket_notification_enqueued',
                context: {
                    ticket_id: event.ticketId,
                    created_by: event.createdBy,
                },
            }),
        );
    }
}
