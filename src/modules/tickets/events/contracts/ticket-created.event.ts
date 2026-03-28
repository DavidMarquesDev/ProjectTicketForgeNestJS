export class TicketCreatedEvent {
    constructor(
        public readonly ticketId: number,
        public readonly createdBy: number,
    ) {}
}
