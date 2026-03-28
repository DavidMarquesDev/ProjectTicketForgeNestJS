import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TraceContextStore } from '../../../common/observability/trace-context.store';
import { AuditLog } from '../entities/audit-log.entity';

type RecordAuditInput = {
    action: string;
    aggregateType: string;
    aggregateId: string;
    actorId?: number | null;
    metadata?: Record<string, unknown>;
};

@Injectable()
export class AuditTrailService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
    ) {}

    async record(input: RecordAuditInput): Promise<void> {
        const auditLog = this.auditLogRepository.create({
            action: input.action,
            aggregateType: input.aggregateType,
            aggregateId: input.aggregateId,
            actorId: input.actorId ?? null,
            traceId: TraceContextStore.getTraceId() ?? null,
            metadata: JSON.stringify(input.metadata ?? {}),
        });

        await this.auditLogRepository.save(auditLog);
    }
}
