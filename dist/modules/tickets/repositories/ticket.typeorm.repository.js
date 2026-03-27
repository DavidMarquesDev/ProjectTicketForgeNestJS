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
exports.TicketTypeOrmRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ticket_entity_1 = require("../entities/ticket.entity");
let TicketTypeOrmRepository = class TicketTypeOrmRepository {
    constructor(ormRepository) {
        this.ormRepository = ormRepository;
    }
    async createAndSave(input) {
        const ticket = this.ormRepository.create({
            title: input.title,
            description: input.description,
            createdBy: input.createdBy,
        });
        return this.ormRepository.save(ticket);
    }
    async findByIdOrFail(ticketId) {
        const ticket = await this.ormRepository.findOne({
            where: { id: ticketId },
            relations: { creator: true, assignee: true },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket não encontrado');
        }
        return ticket;
    }
    async save(ticket) {
        return this.ormRepository.save(ticket);
    }
    async assign(ticketId, assigneeId) {
        await this.ormRepository.update({ id: ticketId }, { assignedTo: assigneeId });
    }
    async paginate(params) {
        const queryBuilder = this.ormRepository
            .createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.creator', 'creator')
            .leftJoinAndSelect('ticket.assignee', 'assignee')
            .orderBy('ticket.createdAt', 'DESC');
        if (params.status) {
            queryBuilder.andWhere('ticket.status = :status', { status: params.status });
        }
        if (params.assigneeId) {
            queryBuilder.andWhere('ticket.assignedTo = :assigneeId', { assigneeId: params.assigneeId });
        }
        const skip = (params.page - 1) * params.limit;
        queryBuilder.skip(skip).take(params.limit);
        const [data, total] = await queryBuilder.getManyAndCount();
        const totalPages = Math.ceil(total / params.limit) || 1;
        return {
            data,
            total,
            page: params.page,
            limit: params.limit,
            totalPages,
        };
    }
    async findOneDetailed(ticketId) {
        return this.ormRepository.findOne({
            where: { id: ticketId },
            relations: { creator: true, assignee: true },
        });
    }
};
exports.TicketTypeOrmRepository = TicketTypeOrmRepository;
exports.TicketTypeOrmRepository = TicketTypeOrmRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ticket_entity_1.Ticket)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TicketTypeOrmRepository);
//# sourceMappingURL=ticket.typeorm.repository.js.map