import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OutboxEventStatus } from './outbox-event-status.enum';

@Entity('outbox_events')
export class OutboxEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'event_id', length: 120, unique: true })
    eventId: string;

    @Column({ name: 'event_name', length: 120 })
    eventName: string;

    @Column({ name: 'schema_version', type: 'int', default: 1 })
    schemaVersion: number;

    @Column({ name: 'aggregate_type', length: 80 })
    aggregateType: string;

    @Column({ name: 'aggregate_id', length: 80 })
    aggregateId: string;

    @Column({ type: 'text' })
    payload: string;

    @Column({
        type: 'simple-enum',
        enum: OutboxEventStatus,
        default: OutboxEventStatus.PENDING,
    })
    status: OutboxEventStatus;

    @Column({ default: 0 })
    attempts: number;

    @Column({ name: 'available_at', type: Date })
    availableAt: Date;

    @Column({ name: 'queued_at', type: Date, nullable: true })
    queuedAt: Date | null;

    @Column({ name: 'processed_at', type: Date, nullable: true })
    processedAt: Date | null;

    @Column({ name: 'dead_lettered_at', type: Date, nullable: true })
    deadLetteredAt: Date | null;

    @Column({ name: 'last_error', type: 'text', nullable: true })
    lastError: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
