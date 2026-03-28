import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 120 })
    action: string;

    @Column({ name: 'aggregate_type', length: 80 })
    aggregateType: string;

    @Column({ name: 'aggregate_id', length: 80 })
    aggregateId: string;

    @Column({ name: 'actor_id', type: 'int', nullable: true })
    actorId: number | null;

    @Column({ name: 'trace_id', length: 120, nullable: true })
    traceId: string | null;

    @Column({ type: 'text' })
    metadata: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
