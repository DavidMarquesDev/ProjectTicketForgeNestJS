export declare class CommentCreatedEvent {
    readonly commentId: number;
    readonly ticketId: number;
    readonly authorId: number;
    constructor(commentId: number, ticketId: number, authorId: number);
}
