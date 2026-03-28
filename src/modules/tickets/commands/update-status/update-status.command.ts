import { UpdateStatusDto } from '../../dto/update-status.dto';

export class UpdateStatusCommand {
    constructor(
        public readonly ticketId: number,
        public readonly dto: UpdateStatusDto,
        public readonly actorId: number,
        public readonly actorRole: string,
    ) {}
}
