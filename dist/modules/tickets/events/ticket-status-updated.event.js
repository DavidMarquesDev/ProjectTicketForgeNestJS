"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketStatusUpdatedEvent = void 0;
class TicketStatusUpdatedEvent {
    constructor(ticketId, status, updatedBy) {
        this.ticketId = ticketId;
        this.status = status;
        this.updatedBy = updatedBy;
    }
}
exports.TicketStatusUpdatedEvent = TicketStatusUpdatedEvent;
//# sourceMappingURL=ticket-status-updated.event.js.map