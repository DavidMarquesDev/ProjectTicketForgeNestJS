export class CreateCommentCommand {
    constructor(
        public readonly ticketId: number,
        public readonly authorId: number,
        public readonly content: string,
    ) {}
}
