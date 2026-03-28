import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../response/api-response';

@Injectable()
export class SuccessResponseInterceptor<T> implements NestInterceptor<T, T | ApiSuccessResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T | ApiSuccessResponse<T>> {
        if (context.getType() !== 'http') {
            return next.handle();
        }

        return next.handle().pipe(
            map((response: T) => {
                if (
                    typeof response === 'object'
                    && response !== null
                    && 'success' in response
                ) {
                    return response;
                }

                return {
                    success: true,
                    data: response,
                };
            }),
        );
    }
}
