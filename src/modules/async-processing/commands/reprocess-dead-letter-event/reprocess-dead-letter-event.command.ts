export class ReprocessDeadLetterEventCommand {
    constructor(
        public readonly outboxEventId: string,
        public readonly actorId: number,
        public readonly actorRole: string,
    ) {}
}

