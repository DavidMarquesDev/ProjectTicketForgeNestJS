"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketPolicyService = void 0;
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../../auth/entities/user.entity");
let TicketPolicyService = class TicketPolicyService {
    assertCanAssign(actorRole) {
        if (actorRole !== user_entity_1.UserRole.ADMIN && actorRole !== user_entity_1.UserRole.SUPPORT) {
            throw new common_1.ForbiddenException('Apenas suporte ou admin podem atribuir ticket');
        }
    }
    assertCanUpdateStatus(ticket, actorId, actorRole) {
        const isOwner = ticket.createdBy === actorId;
        const isAssignee = ticket.assignedTo === actorId;
        const isSupport = actorRole === user_entity_1.UserRole.ADMIN || actorRole === user_entity_1.UserRole.SUPPORT;
        if (!isOwner && !isAssignee && !isSupport) {
            throw new common_1.ForbiddenException('Usuário não possui permissão para atualizar status');
        }
    }
};
exports.TicketPolicyService = TicketPolicyService;
exports.TicketPolicyService = TicketPolicyService = __decorate([
    (0, common_1.Injectable)()
], TicketPolicyService);
//# sourceMappingURL=ticket-policy.service.js.map