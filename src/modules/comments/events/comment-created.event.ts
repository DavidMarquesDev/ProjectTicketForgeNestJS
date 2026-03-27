export class CommentCreatedEvent {
    constructor(
        public readonly commentId: number,
        public readonly ticketId: number,
        public readonly authorId: number,
    ) {}
}
