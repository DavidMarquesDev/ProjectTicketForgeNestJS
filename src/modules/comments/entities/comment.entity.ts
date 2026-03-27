import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'ticket_id' })
    ticketId: number;

    @ManyToOne(() => Ticket, { eager: false })
    @JoinColumn({ name: 'ticket_id' })
    ticket: Ticket;

    @Column({ name: 'author_id' })
    authorId: number;

    @ManyToOne(() => User, { eager: false })
    @JoinColumn({ name: 'author_id' })
    author: User;

    @Column({ type: 'text' })
    content: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
