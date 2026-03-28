import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
    commentsApiNotFoundResponse,
    commentsApiParam,
    commentsApiUnauthorizedResponse,
    createCommentApiBadRequestResponse,
    createCommentApiBody,
    createCommentApiCreatedResponse,
    createCommentApiOperation,
    listCommentsApiBadRequestResponse,
    listCommentsApiOkResponse,
    listCommentsApiOperation,
} from './api/comments.http-documentation';
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

    /**
     * Creates a new comment in a ticket.
     *
     * @param ticketId Ticket identifier.
     * @param dto Comment payload.
     * @param user Authenticated user extracted from JWT.
     * @returns Created comment identifier.
     */
    @ApiOperation(createCommentApiOperation)
    @ApiParam(commentsApiParam)
    @ApiBody(createCommentApiBody)
    @ApiCreatedResponse(createCommentApiCreatedResponse)
    @ApiUnauthorizedResponse(commentsApiUnauthorizedResponse)
    @ApiNotFoundResponse(commentsApiNotFoundResponse)
    @ApiBadRequestResponse(createCommentApiBadRequestResponse)
    @Post()
    create(
        @Param('ticketId', ParseIntPipe) ticketId: number,
        @Body() dto: CreateCommentDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.commandBus.execute(new CreateCommentCommand(ticketId, user.id, dto));
    }

    /**
     * Returns all comments linked to a ticket.
     *
     * @param ticketId Ticket identifier.
     * @returns Comment list for the ticket.
     */
    @ApiOperation(listCommentsApiOperation)
    @ApiParam(commentsApiParam)
    @ApiOkResponse(listCommentsApiOkResponse)
    @ApiUnauthorizedResponse(commentsApiUnauthorizedResponse)
    @ApiBadRequestResponse(listCommentsApiBadRequestResponse)
    @Get()
    findAll(@Param('ticketId', ParseIntPipe) ticketId: number) {
        return this.queryBus.execute(new GetCommentsQuery({ ticketId }));
    }
}
