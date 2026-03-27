"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStatusHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const update_status_command_1 = require("./update-status.command");
const ticket_policy_service_1 = require("../../policies/ticket-policy.service");
const ticket_status_transition_service_1 = require("../../domain/ticket-status-transition.service");
const ticket_repository_interface_1 = require("../../repositories/ticket.repository.interface");
const ticket_status_updated_event_1 = require("../../events/ticket-status-updated.event");
let UpdateStatusHandler = class UpdateStatusHandler {
    constructor(ticketRepository, policyService, statusTransitionService, eventBus) {
        this.ticketRepository = ticketRepository;
        this.policyService = policyService;
        this.statusTransitionService = statusTransitionService;
        this.eventBus = eventBus;
    }
    async execute(command) {
        const ticket = await this.ticketRepository.findByIdOrFail(command.ticketId);
        this.policyService.assertCanUpdateStatus(ticket, command.actorId, command.actorRole);
        this.statusTransitionService.assertValidTransition(ticket.status, command.status);
        ticket.status = command.status;
        await this.ticketRepository.save(ticket);
        this.eventBus.publish(new ticket_status_updated_event_1.TicketStatusUpdatedEvent(command.ticketId, command.status, command.actorId));
        return { id: ticket.id, success: true };
    }
};
exports.UpdateStatusHandler = UpdateStatusHandler;
exports.UpdateStatusHandler = UpdateStatusHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_status_command_1.UpdateStatusCommand),
    __param(0, (0, common_1.Inject)(ticket_repository_interface_1.TICKET_REPOSITORY)),
    __metadata("design:paramtypes", [Object, ticket_policy_service_1.TicketPolicyService,
        ticket_status_transition_service_1.TicketStatusTransitionService,
        cqrs_1.EventBus])
], UpdateStatusHandler);
//# sourceMappingURL=update-status.handler.js.map