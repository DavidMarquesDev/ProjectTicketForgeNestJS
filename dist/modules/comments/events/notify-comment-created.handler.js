"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifyCommentCreatedHandler = void 0;
const comment_created_event_1 = require("./comment-created.event");
const cqrs_1 = require("@nestjs/cqrs");
let NotifyCommentCreatedHandler = class NotifyCommentCreatedHandler {
    handle() { }
};
exports.NotifyCommentCreatedHandler = NotifyCommentCreatedHandler;
exports.NotifyCommentCreatedHandler = NotifyCommentCreatedHandler = __decorate([
    (0, cqrs_1.EventsHandler)(comment_created_event_1.CommentCreatedEvent)
], NotifyCommentCreatedHandler);
//# sourceMappingURL=notify-comment-created.handler.js.map