import { CreateTicketDto } from '../../dto/create-ticket.dto';

export class CreateTicketCommand {
    constructor(
        public readonly dto: CreateTicketDto,
        public readonly createdBy: number,
    ) {}
}
