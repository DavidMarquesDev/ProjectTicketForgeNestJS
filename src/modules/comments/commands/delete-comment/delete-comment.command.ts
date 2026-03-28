export class DeleteCommentCommand {
    constructor(
        public readonly ticketId: number,
        public readonly commentId: number,
        public readonly actorId: number,
        public readonly actorRole: string,
    ) {}
}
