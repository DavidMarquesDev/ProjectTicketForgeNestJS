export declare class CreateCommentCommand {
    readonly ticketId: number;
    readonly authorId: number;
    readonly content: string;
    constructor(ticketId: number, authorId: number, content: string);
}
