"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const typeorm_1 = require("@nestjs/typeorm");
const assign_ticket_handler_1 = require("./commands/assign-ticket/assign-ticket.handler");
const create_ticket_handler_1 = require("./commands/create-ticket/create-ticket.handler");
const update_status_handler_1 = require("./commands/update-status/update-status.handler");
const ticket_status_transition_service_1 = require("./domain/ticket-status-transition.service");
const send_notification_handler_1 = require("./events/send-notification.handler");
const ticket_entity_1 = require("./entities/ticket.entity");
const ticket_policy_service_1 = require("./policies/ticket-policy.service");
const get_ticket_handler_1 = require("./queries/get-ticket/get-ticket.handler");
const get_tickets_handler_1 = require("./queries/get-tickets/get-tickets.handler");
const ticket_repository_interface_1 = require("./repositories/ticket.repository.interface");
const ticket_typeorm_repository_1 = require("./repositories/ticket.typeorm.repository");
const tickets_controller_1 = require("./tickets.controller");
const commandHandlers = [create_ticket_handler_1.CreateTicketHandler, update_status_handler_1.UpdateStatusHandler, assign_ticket_handler_1.AssignTicketHandler];
const queryHandlers = [get_tickets_handler_1.GetTicketsHandler, get_ticket_handler_1.GetTicketHandler];
const eventHandlers = [send_notification_handler_1.SendNotificationHandler];
let TicketsModule = class TicketsModule {
};
exports.TicketsModule = TicketsModule;
exports.TicketsModule = TicketsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule, typeorm_1.TypeOrmModule.forFeature([ticket_entity_1.Ticket])],
        controllers: [tickets_controller_1.TicketsController],
        providers: [
            ticket_policy_service_1.TicketPolicyService,
            ticket_status_transition_service_1.TicketStatusTransitionService,
            ticket_typeorm_repository_1.TicketTypeOrmRepository,
            {
                provide: ticket_repository_interface_1.TICKET_REPOSITORY,
                useExisting: ticket_typeorm_repository_1.TicketTypeOrmRepository,
            },
            ...commandHandlers,
            ...queryHandlers,
            ...eventHandlers,
        ],
        exports: [ticket_repository_interface_1.TICKET_REPOSITORY],
    })
], TicketsModule);
//# sourceMappingURL=tickets.module.js.map