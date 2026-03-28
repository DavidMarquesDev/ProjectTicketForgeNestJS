import { DeadLetterPayloadMaskMode } from '../queries/get-dead-letter-event-by-id/get-dead-letter-event-by-id.query';

export class DeadLetterPayloadMaskerHelper {
    private static readonly defaultMaxPayloadLength = 8000;
    private static readonly minPayloadLength = 256;
    private static readonly sensitiveKeys = [
        'password',
        'passwordhash',
        'token',
        'secret',
        'apikey',
        'api_key',
        'authorization',
        'cpf',
        'email',
    ];

    static parsePayload(payload: string): unknown {
        try {
            return JSON.parse(payload) as unknown;
        } catch {
            return {
                content: 'payload inválido',
            };
        }
    }

    static maskSensitiveData(
        value: unknown,
        parentKey?: string,
        mode: DeadLetterPayloadMaskMode = DeadLetterPayloadMaskMode.TOTAL,
    ): unknown {
        if (Array.isArray(value)) {
            return value.map((item) => this.maskSensitiveData(item, parentKey, mode));
        }

        if (value === null || value === undefined) {
            return value;
        }

        if (typeof value === 'object') {
            const output: Record<string, unknown> = {};
            const input = value as Record<string, unknown>;
            for (const [key, childValue] of Object.entries(input)) {
                output[key] = this.maskSensitiveData(childValue, key, mode);
            }

            return output;
        }

        if (this.isSensitiveKey(parentKey)) {
            return this.maskPrimitiveValue(value, parentKey, mode);
        }

        return value;
    }

    static truncatePayloadIfNeeded(value: unknown, maxPayloadLength?: number): unknown {
        const normalizedMaxPayloadLength = this.normalizeMaxPayloadLength(maxPayloadLength);
        const serializedPayload = this.safeSerialize(value);

        if (serializedPayload.length <= normalizedMaxPayloadLength) {
            return value;
        }

        return {
            truncated: true,
            maxLength: normalizedMaxPayloadLength,
            originalLength: serializedPayload.length,
            preview: `${serializedPayload.slice(0, normalizedMaxPayloadLength)}...`,
        };
    }

    private static isSensitiveKey(key?: string): boolean {
        if (!key) {
            return false;
        }

        const normalizedKey = key.toLowerCase();

        return this.sensitiveKeys.some((sensitiveKey) => normalizedKey.includes(sensitiveKey));
    }

    private static maskPrimitiveValue(
        value: unknown,
        key: string | undefined,
        mode: DeadLetterPayloadMaskMode,
    ): unknown {
        if (mode === DeadLetterPayloadMaskMode.TOTAL) {
            return '***';
        }

        if (typeof value !== 'string') {
            return '***';
        }

        const normalizedKey = (key ?? '').toLowerCase();

        if (normalizedKey.includes('email')) {
            const [username, domain] = value.split('@');
            if (!domain) {
                return '***';
            }

            const visibleStart = username.slice(0, 1);
            return `${visibleStart}***@${domain}`;
        }

        if (normalizedKey.includes('cpf')) {
            if (value.length < 4) {
                return '***';
            }

            const visibleEnd = value.slice(-4);
            return `***${visibleEnd}`;
        }

        return '***';
    }

    private static normalizeMaxPayloadLength(maxPayloadLength?: number): number {
        const normalizedValue = typeof maxPayloadLength === 'number' ? maxPayloadLength : Number.NaN;
        if (!Number.isInteger(normalizedValue) || normalizedValue < this.minPayloadLength) {
            return this.defaultMaxPayloadLength;
        }

        return normalizedValue;
    }

    private static safeSerialize(value: unknown): string {
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }
}
