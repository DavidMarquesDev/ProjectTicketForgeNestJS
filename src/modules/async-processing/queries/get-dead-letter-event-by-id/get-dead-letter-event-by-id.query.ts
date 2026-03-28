export enum DeadLetterPayloadMaskMode {
    TOTAL = 'total',
    PARTIAL = 'partial',
}

export class GetDeadLetterEventByIdQuery {
    constructor(
        public readonly outboxEventId: string,
        public readonly maskMode: DeadLetterPayloadMaskMode = DeadLetterPayloadMaskMode.TOTAL,
    ) {}
}
