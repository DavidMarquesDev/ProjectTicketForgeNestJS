export class CreateTicketCommand {
    constructor(
        public readonly title: string,
        public readonly description: string,
        public readonly createdBy: number,
    ) {}
}
