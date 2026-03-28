import { DeadLetterSortBy, DeadLetterSortOrder } from '../../../outbox/outbox.service';

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
};

export class ListDeadLetterEventsQuery {
    constructor(public readonly filters: ListDeadLetterEventsFilters) {}
}

