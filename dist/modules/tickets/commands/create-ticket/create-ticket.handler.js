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
exports.CreateTicketHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_ticket_command_1 = require("./create-ticket.command");
const ticket_repository_interface_1 = require("../../repositories/ticket.repository.interface");
const ticket_created_event_1 = require("../../events/ticket-created.event");
let CreateTicketHandler = class CreateTicketHandler {
    constructor(ticketRepository, eventBus) {
        this.ticketRepository = ticketRepository;
        this.eventBus = eventBus;
    }
    async execute(command) {
        const ticket = await this.ticketRepository.createAndSave({
            title: command.title,
            description: command.description,
            createdBy: command.createdBy,
        });
        this.eventBus.publish(new ticket_created_event_1.TicketCreatedEvent(ticket.id, command.createdBy));
        return { id: ticket.id, success: true };
    }
};
exports.CreateTicketHandler = CreateTicketHandler;
exports.CreateTicketHandler = CreateTicketHandler = __decorate([
    (0, cqrs_1.CommandHandler)(create_ticket_command_1.CreateTicketCommand),
    __param(0, (0, common_1.Inject)(ticket_repository_interface_1.TICKET_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventBus])
], CreateTicketHandler);
//# sourceMappingURL=create-ticket.handler.js.map