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
    @ApiOperation({
        summary: 'Create a comment for a ticket',
        description: 'Creates a comment for an existing ticket using authenticated user context.',
    })
    @ApiParam({ name: 'ticketId', example: 101, description: 'Ticket identifier' })
    @ApiBody({
        type: CreateCommentDto,
        description: 'Comment payload',
        examples: {
            valid: {
                summary: 'Valid comment',
                value: {
                    content: 'Issue acknowledged. Working on a fix.',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'Comment created successfully',
        schema: {
            example: {
                id: 3001,
                success: true,
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Missing or invalid token',
        schema: {
            example: {
                success: false,
                message: 'Unauthorized',
                code: 'UNAUTHORIZED',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'Ticket not found',
        schema: {
            example: {
                success: false,
                message: 'Ticket não encontrado',
                code: 'NOT_FOUND',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Validation error',
        schema: {
            example: {
                success: false,
                message: 'content must be longer than or equal to 2 characters',
                code: 'BAD_REQUEST',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @Post()
    create(
        @Param('ticketId', ParseIntPipe) ticketId: number,
        @Body() dto: CreateCommentDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.commandBus.execute(new CreateCommentCommand(ticketId, user.id, dto.content));
    }

    /**
     * Returns all comments linked to a ticket.
     *
     * @param ticketId Ticket identifier.
     * @returns Comment list for the ticket.
     */
    @ApiOperation({
        summary: 'List comments by ticket',
        description: 'Returns all comments linked to a specific ticket.',
    })
    @ApiParam({ name: 'ticketId', example: 101, description: 'Ticket identifier' })
    @ApiOkResponse({
        description: 'Comments returned successfully',
        schema: {
            example: {
                success: true,
                data: [
                    {
                        id: 3001,
                        ticketId: 101,
                        authorId: 1,
                        content: 'Issue acknowledged. Working on a fix.',
                        createdAt: '2026-03-27T12:00:00.000Z',
                    },
                ],
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Missing or invalid token',
        schema: {
            example: {
                success: false,
                message: 'Unauthorized',
                code: 'UNAUTHORIZED',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Validation error',
        schema: {
            example: {
                success: false,
                message: 'Validation failed (numeric string is expected)',
                code: 'BAD_REQUEST',
                trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
            },
        },
    })
    @Get()
    findAll(@Param('ticketId', ParseIntPipe) ticketId: number) {
        return this.queryBus.execute(new GetCommentsQuery(ticketId));
    }
}
