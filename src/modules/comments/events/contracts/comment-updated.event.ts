export class CommentUpdatedEvent {
    constructor(
        public readonly commentId: number,
        public readonly ticketId: number,
        public readonly updatedBy: number,
    ) {}
}
