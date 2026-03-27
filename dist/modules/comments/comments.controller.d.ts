import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class CommentsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(ticketId: number, dto: CreateCommentDto, user: AuthenticatedUser): Promise<any>;
    findAll(ticketId: number): Promise<any>;
}
