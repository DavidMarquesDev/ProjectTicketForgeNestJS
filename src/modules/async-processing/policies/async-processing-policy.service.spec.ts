import { ForbiddenException } from '@nestjs/common';
import { AsyncProcessingPolicyService } from './async-processing-policy.service';

describe('AsyncProcessingPolicyService', () => {
    it('deve permitir reprocessamento para admin', () => {
        const policy = new AsyncProcessingPolicyService();
        expect(() => policy.assertCanReprocessDeadLetter('admin')).not.toThrow();
    });

    it('deve bloquear reprocessamento para perfis não admin', () => {
        const policy = new AsyncProcessingPolicyService();
        expect(() => policy.assertCanReprocessDeadLetter('support')).toThrow(ForbiddenException);
    });
});

