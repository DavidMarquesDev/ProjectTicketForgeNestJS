export class AssignTicketCommand {
    constructor(
        public readonly ticketId: number,
        public readonly assigneeId: number,
        public readonly actorRole: string,
    ) {}
}
