import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { TicketStatus } from './ticket-status.enum';

@Entity('tickets')
export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 200 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
    status: TicketStatus;

    @Column({ name: 'created_by' })
    createdBy: number;

    @ManyToOne(() => User, { eager: false })
    @JoinColumn({ name: 'created_by' })
    creator: User;

    @Column({ name: 'assigned_to', nullable: true })
    assignedTo: number | null;

    @ManyToOne(() => User, { eager: false, nullable: true })
    @JoinColumn({ name: 'assigned_to' })
    assignee: User | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
