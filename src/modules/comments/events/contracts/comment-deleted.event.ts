export class CommentDeletedEvent {
    constructor(
        public readonly commentId: number,
        public readonly ticketId: number,
        public readonly deletedBy: number,
    ) {}
}
