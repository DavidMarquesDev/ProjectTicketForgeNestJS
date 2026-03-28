import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { toStructuredLog } from '../../../common/logging/structured-log.helper';
import { TicketCreatedEvent } from './ticket-created.event';

@EventsHandler(TicketCreatedEvent)
export class SendNotificationHandler implements IEventHandler<TicketCreatedEvent> {
    private readonly logger = new Logger(SendNotificationHandler.name);

    handle(event: TicketCreatedEvent): void {
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
