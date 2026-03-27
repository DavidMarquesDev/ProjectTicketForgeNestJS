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
exports.AssignTicketHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const assign_ticket_command_1 = require("./assign-ticket.command");
const ticket_policy_service_1 = require("../../policies/ticket-policy.service");
const ticket_repository_interface_1 = require("../../repositories/ticket.repository.interface");
let AssignTicketHandler = class AssignTicketHandler {
    constructor(ticketRepository, policyService) {
        this.ticketRepository = ticketRepository;
        this.policyService = policyService;
    }
    async execute(command) {
        this.policyService.assertCanAssign(command.actorRole);
        await this.ticketRepository.findByIdOrFail(command.ticketId);
        await this.ticketRepository.assign(command.ticketId, command.assigneeId);
        return { id: command.ticketId, success: true };
    }
};
exports.AssignTicketHandler = AssignTicketHandler;
exports.AssignTicketHandler = AssignTicketHandler = __decorate([
    (0, cqrs_1.CommandHandler)(assign_ticket_command_1.AssignTicketCommand),
    __param(0, (0, common_1.Inject)(ticket_repository_interface_1.TICKET_REPOSITORY)),
    __metadata("design:paramtypes", [Object, ticket_policy_service_1.TicketPolicyService])
], AssignTicketHandler);
//# sourceMappingURL=assign-ticket.handler.js.map