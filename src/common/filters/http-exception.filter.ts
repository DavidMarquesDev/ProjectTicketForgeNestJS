import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    ValidationError,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../response/api-response';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Erro interno do servidor';
        let code = 'INTERNAL_SERVER_ERROR';
        let errors: Record<string, unknown> | undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const normalized = exceptionResponse as {
                    message?: string | string[];
                    error?: string;
                    errors?: ValidationError[] | Record<string, unknown>;
                };
                if (Array.isArray(normalized.message)) {
                    message = normalized.message.join(', ');
                } else if (normalized.message) {
                    message = normalized.message;
                }
                code = normalized.error?.toUpperCase().replace(/\s+/g, '_') ?? code;
                if (normalized.errors) {
                    errors = normalized.errors as Record<string, unknown>;
                }
            }
        }

        const errorPayload: ApiErrorResponse = {
            success: false,
            message,
            code,
            errors,
            trace_id: request.headers['x-request-id'] as string | undefined,
        };

        response.status(status).json(errorPayload);
    }
}
