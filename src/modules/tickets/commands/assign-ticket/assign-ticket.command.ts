import { AssignTicketDto } from '../../dto/assign-ticket.dto';

export class AssignTicketCommand {
    constructor(
        public readonly ticketId: number,
        public readonly dto: AssignTicketDto,
        public readonly actorRole: string,
        public readonly actorId: number,
    ) {}
}
