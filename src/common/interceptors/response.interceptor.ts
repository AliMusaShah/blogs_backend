import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
    success: true;
    data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
        // code before next.handle() runs BEFORE the controller method
        return next.handle().pipe(
            // map runs AFTER the controller returns, and reshapes the result
            map((data) => ({ success: true as const, data })),
        );
    }
}