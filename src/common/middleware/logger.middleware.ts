import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();

        // the status code only exists once the response is finished
        res.on('finish', () => {
            console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
        });

        next(); // forget this and every request hangs
    }
}