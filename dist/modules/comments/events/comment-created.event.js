"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentCreatedEvent = void 0;
class CommentCreatedEvent {
    constructor(commentId, ticketId, authorId) {
        this.commentId = commentId;
        this.ticketId = ticketId;
        this.authorId = authorId;
    }
}
exports.CommentCreatedEvent = CommentCreatedEvent;
//# sourceMappingURL=comment-created.event.js.map