import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { ReprocessDeadLetterEventService } from '../../services/reprocess-dead-letter-event.service';
import { ReprocessDeadLetterEventCommand } from './reprocess-dead-letter-event.command';

@CommandHandler(ReprocessDeadLetterEventCommand)
export class ReprocessDeadLetterEventHandler implements ICommandHandler<ReprocessDeadLetterEventCommand> {
    constructor(private readonly reprocessDeadLetterEventService: ReprocessDeadLetterEventService) {}

    async execute(command: ReprocessDeadLetterEventCommand) {
        return this.reprocessDeadLetterEventService.execute({
            outboxEventId: command.outboxEventId,
            actorId: command.actorId,
            actorRole: command.actorRole,
        });
    }
}

