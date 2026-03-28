import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from './logout.command';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
    /**
     * Confirms logout flow for authenticated users.
     *
     * @returns Success confirmation payload.
     */
    async execute(): Promise<{ success: true }> {
        return { success: true };
    }
}
