"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketStatusTransitionService = void 0;
const common_1 = require("@nestjs/common");
const ticket_status_enum_1 = require("../entities/ticket-status.enum");
let TicketStatusTransitionService = class TicketStatusTransitionService {
    constructor() {
        this.transitions = {
            [ticket_status_enum_1.TicketStatus.OPEN]: [ticket_status_enum_1.TicketStatus.IN_PROGRESS],
            [ticket_status_enum_1.TicketStatus.IN_PROGRESS]: [ticket_status_enum_1.TicketStatus.RESOLVED],
            [ticket_status_enum_1.TicketStatus.RESOLVED]: [ticket_status_enum_1.TicketStatus.CLOSED],
            [ticket_status_enum_1.TicketStatus.CLOSED]: [],
        };
    }
    assertValidTransition(currentStatus, nextStatus) {
        const allowed = this.transitions[currentStatus] ?? [];
        if (!allowed.includes(nextStatus)) {
            throw new common_1.ConflictException('Transição de status inválida');
        }
    }
};
exports.TicketStatusTransitionService = TicketStatusTransitionService;
exports.TicketStatusTransitionService = TicketStatusTransitionService = __decorate([
    (0, common_1.Injectable)()
], TicketStatusTransitionService);
//# sourceMappingURL=ticket-status-transition.service.js.map