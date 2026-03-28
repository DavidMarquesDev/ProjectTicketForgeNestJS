import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
    commentsApiNotFoundResponse,
    commentsApiParam,
    commentsApiUnauthorizedResponse,
    commentApiNotFoundResponse,
    commentIdApiParam,
    createCommentApiBadRequestResponse,
    createCommentApiBody,
    createCommentApiCreatedResponse,
    createCommentApiOperation,
    deleteCommentApiForbiddenResponse,
    deleteCommentApiOkResponse,
    deleteCommentApiOperation,
    listCommentsApiBadRequestResponse,
    listCommentsApiLimitQuery,
    listCommentsApiOkResponse,
    listCommentsApiOrderQuery,
    listCommentsApiOperation,
    listCommentsApiPageQuery,
    updateCommentApiBody,
    updateCommentApiForbiddenResponse,
    updateCommentApiOkResponse,
    updateCommentApiOperation,
} from './api/comments.http-documentation';
import { CreateCommentCommand } from './commands/create-comment/create-comment.command';
import { DeleteCommentCommand } from './commands/delete-comment/delete-comment.command';
import { UpdateCommentCommand } from './commands/update-comment/update-comment.command';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetCommentsQueryDto } from './dto/get-comments-query.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
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
    @ApiQuery(listCommentsApiPageQuery)
    @ApiQuery(listCommentsApiLimitQuery)
    @ApiQuery(listCommentsApiOrderQuery)
    @ApiOkResponse(listCommentsApiOkResponse)
    @ApiUnauthorizedResponse(commentsApiUnauthorizedResponse)
    @ApiBadRequestResponse(listCommentsApiBadRequestResponse)
    @Get()
    findAll(
        @Param('ticketId', ParseIntPipe) ticketId: number,
        @Query() query: GetCommentsQueryDto,
    ) {
        return this.queryBus.execute(
            new GetCommentsQuery({
                ticketId,
                page: query.page ?? 1,
                limit: query.limit ?? 20,
                order: query.order,
            }),
        );
    }

    /**
     * Updates comment content for a ticket.
     *
     * @param ticketId Ticket identifier.
     * @param commentId Comment identifier.
     * @param dto Updated comment payload.
     * @param user Authenticated user extracted from JWT.
     * @returns Updated comment identifier.
     */
    @ApiOperation(updateCommentApiOperation)
    @ApiParam(commentsApiParam)
    @ApiParam(commentIdApiParam)
    @ApiBody(updateCommentApiBody)
    @ApiOkResponse(updateCommentApiOkResponse)
    @ApiUnauthorizedResponse(commentsApiUnauthorizedResponse)
    @ApiForbiddenResponse(updateCommentApiForbiddenResponse)
    @ApiNotFoundResponse(commentApiNotFoundResponse)
    @ApiBadRequestResponse(createCommentApiBadRequestResponse)
    @Patch(':id')
    update(
        @Param('ticketId', ParseIntPipe) ticketId: number,
        @Param('id', ParseIntPipe) commentId: number,
        @Body() dto: UpdateCommentDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.commandBus.execute(
            new UpdateCommentCommand(ticketId, commentId, user.id, user.role, dto),
        );
    }

    /**
     * Deletes a comment from a ticket.
     *
     * @param ticketId Ticket identifier.
     * @param commentId Comment identifier.
     * @param user Authenticated user extracted from JWT.
     * @returns Deleted comment identifier.
     */
    @ApiOperation(deleteCommentApiOperation)
    @ApiParam(commentsApiParam)
    @ApiParam(commentIdApiParam)
    @ApiOkResponse(deleteCommentApiOkResponse)
    @ApiUnauthorizedResponse(commentsApiUnauthorizedResponse)
    @ApiForbiddenResponse(deleteCommentApiForbiddenResponse)
    @ApiNotFoundResponse(commentApiNotFoundResponse)
    @ApiBadRequestResponse(createCommentApiBadRequestResponse)
    @Delete(':id')
    remove(
        @Param('ticketId', ParseIntPipe) ticketId: number,
        @Param('id', ParseIntPipe) commentId: number,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.commandBus.execute(
            new DeleteCommentCommand(ticketId, commentId, user.id, user.role),
        );
    }
}
