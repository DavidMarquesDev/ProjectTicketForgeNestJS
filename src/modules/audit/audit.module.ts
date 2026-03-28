import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditTrailService } from './services/audit-trail.service';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([AuditLog])],
    providers: [AuditTrailService],
    exports: [AuditTrailService],
})
export class AuditModule {}
