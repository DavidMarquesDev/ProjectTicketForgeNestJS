import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '../../auth/entities/user.entity';

@Injectable()
export class AsyncProcessingPolicyService {
    assertCanReprocessDeadLetter(actorRole: string): void {
        if (actorRole !== UserRole.ADMIN) {
            throw new ForbiddenException('Apenas admin pode reprocessar eventos da dead letter queue');
        }
    }
}

