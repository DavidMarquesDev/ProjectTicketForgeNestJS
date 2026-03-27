import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateCommentCommand } from './commands/create-comment/create-comment.command';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetCommentsQuery } from './queries/get-comments/get-comments.query';

@ApiTags('comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets/:ticketId/comments')
export class CommentsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Post()
    create(
        @Param('ticketId', ParseIntPipe) ticketId: number,
        @Body() dto: CreateCommentDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.commandBus.execute(new CreateCommentCommand(ticketId, user.id, dto.content));
    }

    @Get()
    findAll(@Param('ticketId', ParseIntPipe) ticketId: number) {
        return this.queryBus.execute(new GetCommentsQuery(ticketId));
    }
}
