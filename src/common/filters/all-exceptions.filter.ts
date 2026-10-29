import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { mapPrismaError } from '../errors/prisma-error.mapper.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();

        let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';

        if (exception instanceof HttpException) {
            // validation errors, NotFoundException thrown by you, etc.
            statusCode = exception.getStatus();
            const body = exception.getResponse();
            message = typeof body === 'string' ? body : ((body as any).message ?? exception.message);
        } else {
            const prismaError = mapPrismaError(exception);
            if (prismaError) {
                statusCode = prismaError.status;
                message = prismaError.message;
            } else {
                // a real bug: log the details, never send them to the client
                this.logger.error(exception instanceof Error ? exception.stack : String(exception));
            }
        }

        res.status(statusCode).json({
            success: false,
            statusCode,
            message,
            path: req.originalUrl,
        });
    }
}