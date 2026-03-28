import { CreateCommentDto } from '../../dto/create-comment.dto';

export class CreateCommentCommand {
    constructor(
        public readonly ticketId: number,
        public readonly authorId: number,
        public readonly dto: CreateCommentDto,
    ) {}
}
