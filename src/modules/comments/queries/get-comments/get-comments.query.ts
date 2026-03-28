type GetCommentsFilter = {
    ticketId: number;
};

export class GetCommentsQuery {
    constructor(public readonly filter: GetCommentsFilter) {}
}
