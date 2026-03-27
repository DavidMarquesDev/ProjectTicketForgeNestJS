import { ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from './logout.command';
export declare class LogoutHandler implements ICommandHandler<LogoutCommand> {
    execute(): Promise<{
        success: true;
    }>;
}
