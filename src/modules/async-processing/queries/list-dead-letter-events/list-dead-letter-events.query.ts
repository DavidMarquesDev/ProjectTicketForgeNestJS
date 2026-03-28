import { DeadLetterSortBy, DeadLetterSortOrder } from '../../../outbox/outbox.service';
import { DeadLetterPayloadMaskMode } from '../get-dead-letter-event-by-id/get-dead-letter-event-by-id.query';

type ListDeadLetterEventsFilters = {
    page: number;
    limit: number;
    eventName?: string;
    aggregateType?: string;
    from?: string;
    to?: string;
    attemptsMin?: number;
    attemptsMax?: number;
    sortBy?: DeadLetterSortBy;
    order?: DeadLetterSortOrder;
    maskMode?: DeadLetterPayloadMaskMode;
};

export class ListDeadLetterEventsQuery {
    constructor(public readonly filters: ListDeadLetterEventsFilters) {}
}
