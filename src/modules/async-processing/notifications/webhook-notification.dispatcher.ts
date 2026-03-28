import { Injectable, Logger } from '@nestjs/common';
import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { toStructuredLog } from '../../../common/logging/structured-log.helper';
import { INotificationDispatcher, NotificationDispatchRequest } from './notification-dispatcher.interface';

type HttpRequestFunction = typeof httpRequest;

@Injectable()
export class WebhookNotificationDispatcher implements INotificationDispatcher {
    private readonly logger = new Logger(WebhookNotificationDispatcher.name);
    private readonly webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL?.trim();
    private readonly timeoutMs = Number(process.env.NOTIFICATION_WEBHOOK_TIMEOUT_MS ?? 5000);

    async dispatch(request: NotificationDispatchRequest): Promise<void> {
        if (!this.webhookUrl) {
            this.logger.warn(
                toStructuredLog({
                    level: 'warn',
                    action: 'notification_skipped_no_webhook',
                    context: {
                        event_name: request.eventName,
                        aggregate_id: request.aggregateId,
                    },
                }),
            );
            return;
        }

        await this.sendWebhookPayload(request);
        this.logger.log(
            toStructuredLog({
                level: 'info',
                action: 'notification_sent',
                context: {
                    event_name: request.eventName,
                    aggregate_id: request.aggregateId,
                    destination: this.webhookUrl,
                },
            }),
        );
    }

    private async sendWebhookPayload(requestPayload: NotificationDispatchRequest): Promise<void> {
        const url = new URL(this.webhookUrl as string);
        const serializedPayload = JSON.stringify(requestPayload);
        const requester = this.resolveRequester(url.protocol);

        await new Promise<void>((resolve, reject) => {
            const clientRequest = requester(
                url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(serializedPayload),
                    },
                    timeout: this.timeoutMs,
                },
                (response) => {
                    const statusCode = response.statusCode ?? 0;
                    const isSuccess = statusCode >= 200 && statusCode < 300;

                    if (isSuccess) {
                        resolve();
                        return;
                    }

                    reject(new Error(`Falha ao enviar notificação webhook. status=${statusCode}`));
                },
            );

            clientRequest.on('error', (error: Error) => reject(error));
            clientRequest.on('timeout', () => {
                clientRequest.destroy(new Error('Timeout ao enviar notificação webhook'));
            });
            clientRequest.write(serializedPayload);
            clientRequest.end();
        });
    }

    private resolveRequester(protocol: string): HttpRequestFunction {
        if (protocol === 'http:') {
            return httpRequest;
        }

        return httpsRequest;
    }
}
