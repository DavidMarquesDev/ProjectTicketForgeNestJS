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
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const assign_ticket_command_1 = require("./commands/assign-ticket/assign-ticket.command");
const create_ticket_command_1 = require("./commands/create-ticket/create-ticket.command");
const update_status_command_1 = require("./commands/update-status/update-status.command");
const assign_ticket_dto_1 = require("./dto/assign-ticket.dto");
const create_ticket_dto_1 = require("./dto/create-ticket.dto");
const get_tickets_query_dto_1 = require("./dto/get-tickets-query.dto");
const update_status_dto_1 = require("./dto/update-status.dto");
const get_ticket_query_1 = require("./queries/get-ticket/get-ticket.query");
const get_tickets_query_1 = require("./queries/get-tickets/get-tickets.query");
let TicketsController = class TicketsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    create(dto, user) {
        return this.commandBus.execute(new create_ticket_command_1.CreateTicketCommand(dto.title, dto.description, user.id));
    }
    updateStatus(id, dto, user) {
        return this.commandBus.execute(new update_status_command_1.UpdateStatusCommand(id, dto.status, user.id, user.role));
    }
    assign(id, dto, user) {
        return this.commandBus.execute(new assign_ticket_command_1.AssignTicketCommand(id, dto.userId, user.role));
    }
    findAll(query) {
        return this.queryBus.execute(new get_tickets_query_1.GetTicketsQuery(query.page ?? 1, query.limit ?? 20, query.status, query.assigneeId));
    }
    findOne(id) {
        return this.queryBus.execute(new get_ticket_query_1.GetTicketQuery(id));
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ticket_dto_1.CreateTicketDto, Object]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_status_dto_1.UpdateStatusDto, Object]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/assign'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, assign_ticket_dto_1.AssignTicketDto, Object]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "assign", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_tickets_query_dto_1.GetTicketsQueryDto]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "findOne", null);
exports.TicketsController = TicketsController = __decorate([
    (0, swagger_1.ApiTags)('tickets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tickets'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], TicketsController);
//# sourceMappingURL=tickets.controller.js.map