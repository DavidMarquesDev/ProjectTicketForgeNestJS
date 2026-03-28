export class TicketAssignedEvent {
    constructor(
        public readonly ticketId: number,
        public readonly assignedTo: number,
        public readonly assignedBy: number,
    ) {}
}
