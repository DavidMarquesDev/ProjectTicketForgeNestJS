export class GetDeadLetterEventByIdQuery {
    constructor(public readonly outboxEventId: string) {}
}

