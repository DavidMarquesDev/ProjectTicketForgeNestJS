import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeadLetterPayloadMaskerHelper } from '../helpers/dead-letter-payload-masker.helper';
import { DeadLetterPayloadMaskMode } from '../queries/get-dead-letter-event-by-id/get-dead-letter-event-by-id.query';

@Injectable()
export class DeadLetterPayloadMaskingService {
    constructor(private readonly configService: ConfigService) {}

    maskAndTruncatePayload(payload: string, maskMode: DeadLetterPayloadMaskMode): unknown {
        const parsedPayload = DeadLetterPayloadMaskerHelper.parsePayload(payload);
        const maskedPayload = DeadLetterPayloadMaskerHelper.maskSensitiveData(
            parsedPayload,
            undefined,
            maskMode,
        );

        return DeadLetterPayloadMaskerHelper.truncatePayloadIfNeeded(
            maskedPayload,
            this.resolveMaxPayloadLength(),
        );
    }

    private resolveMaxPayloadLength(): number | undefined {
        const configuredValue = this.configService.get<string>('DLQ_MASKED_PAYLOAD_MAX_LENGTH');
        if (!configuredValue) {
            return undefined;
        }

        const parsedValue = Number(configuredValue);

        if (!Number.isInteger(parsedValue)) {
            return undefined;
        }

        return parsedValue;
    }
}
