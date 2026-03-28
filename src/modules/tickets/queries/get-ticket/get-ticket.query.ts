type GetTicketFilter = {
    ticketId: number;
};

export class GetTicketQuery {
    constructor(public readonly filter: GetTicketFilter) {}
}
