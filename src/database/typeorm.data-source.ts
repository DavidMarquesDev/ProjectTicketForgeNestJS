import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../modules/auth/entities/user.entity';
import { Comment } from '../modules/comments/entities/comment.entity';
import { OutboxEvent } from '../modules/outbox/entities/outbox-event.entity';
import { Ticket } from '../modules/tickets/entities/ticket.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não definida para executar migrations');
}

const migrationsPath = __filename.endsWith('.ts')
    ? ['src/database/migrations/*.ts']
    : ['dist/database/migrations/*.js'];

export default new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User, Ticket, Comment, OutboxEvent, AuditLog],
    migrations: migrationsPath,
    synchronize: false,
});
