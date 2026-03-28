import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity('idempotency_keys')
@Unique('UQ_idempotency_scope_actor_key', ['scope', 'actorId', 'key'])
@Index('IDX_idempotency_scope_actor_key', ['scope', 'actorId', 'key'])
export class IdempotencyKey {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'scope', type: 'varchar', length: 120 })
    scope: string;

    @Column({ name: 'actor_id', type: 'integer' })
    actorId: number;

    @Column({ name: 'idempotency_key', type: 'varchar', length: 120 })
    key: string;

    @Column({ name: 'response_payload', type: 'text' })
    responsePayload: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

