"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCommentHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const ticket_repository_interface_1 = require("../../../tickets/repositories/ticket.repository.interface");
const create_comment_command_1 = require("./create-comment.command");
const comment_repository_interface_1 = require("../../repositories/comment.repository.interface");
const comment_created_event_1 = require("../../events/comment-created.event");
let CreateCommentHandler = class CreateCommentHandler {
    constructor(commentRepository, ticketRepository, eventBus) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.eventBus = eventBus;
    }
    async execute(command) {
        const ticket = await this.ticketRepository.findOneDetailed(command.ticketId);
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket não encontrado');
        }
        const comment = await this.commentRepository.createAndSave({
            ticketId: command.ticketId,
            authorId: command.authorId,
            content: command.content,
        });
        this.eventBus.publish(new comment_created_event_1.CommentCreatedEvent(comment.id, command.ticketId, command.authorId));
        return { id: comment.id, success: true };
    }
};
exports.CreateCommentHandler = CreateCommentHandler;
exports.CreateCommentHandler = CreateCommentHandler = __decorate([
    (0, cqrs_1.CommandHandler)(create_comment_command_1.CreateCommentCommand),
    __param(0, (0, common_1.Inject)(comment_repository_interface_1.COMMENT_REPOSITORY)),
    __param(1, (0, common_1.Inject)(ticket_repository_interface_1.TICKET_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, cqrs_1.EventBus])
], CreateCommentHandler);
//# sourceMappingURL=create-comment.handler.js.map