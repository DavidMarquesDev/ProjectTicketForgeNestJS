import { UpdateCommentDto } from '../../dto/update-comment.dto';

export class UpdateCommentCommand {
    constructor(
        public readonly ticketId: number,
        public readonly commentId: number,
        public readonly actorId: number,
        public readonly actorRole: string,
        public readonly dto: UpdateCommentDto,
    ) {}
}
