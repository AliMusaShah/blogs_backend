import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // empty = catch everything, not just HttpException
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const body = exception.getResponse();
            // body is a string, or an object whose "message" may be a string or an array
            message = typeof body === 'string' ? body : ((body as any).message ?? exception.message);
        } else {
            console.error('exception:', exception); // unexpected bug: log it, but don't leak details to the client
        }

        res.status(statusCode).json({
            success: false,
            statusCode,
            message,
            path: req.originalUrl,
        });
    }
}