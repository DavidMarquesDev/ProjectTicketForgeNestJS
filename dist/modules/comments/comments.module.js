"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const typeorm_1 = require("@nestjs/typeorm");
const tickets_module_1 = require("../tickets/tickets.module");
const create_comment_handler_1 = require("./commands/create-comment/create-comment.handler");
const comments_controller_1 = require("./comments.controller");
const notify_comment_created_handler_1 = require("./events/notify-comment-created.handler");
const comment_entity_1 = require("./entities/comment.entity");
const get_comments_handler_1 = require("./queries/get-comments/get-comments.handler");
const comment_repository_interface_1 = require("./repositories/comment.repository.interface");
const comment_typeorm_repository_1 = require("./repositories/comment.typeorm.repository");
const commandHandlers = [create_comment_handler_1.CreateCommentHandler];
const queryHandlers = [get_comments_handler_1.GetCommentsHandler];
const eventHandlers = [notify_comment_created_handler_1.NotifyCommentCreatedHandler];
let CommentsModule = class CommentsModule {
};
exports.CommentsModule = CommentsModule;
exports.CommentsModule = CommentsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule, typeorm_1.TypeOrmModule.forFeature([comment_entity_1.Comment]), tickets_module_1.TicketsModule],
        controllers: [comments_controller_1.CommentsController],
        providers: [
            comment_typeorm_repository_1.CommentTypeOrmRepository,
            {
                provide: comment_repository_interface_1.COMMENT_REPOSITORY,
                useExisting: comment_typeorm_repository_1.CommentTypeOrmRepository,
            },
            ...commandHandlers,
            ...queryHandlers,
            ...eventHandlers,
        ],
    })
], CommentsModule);
//# sourceMappingURL=comments.module.js.map