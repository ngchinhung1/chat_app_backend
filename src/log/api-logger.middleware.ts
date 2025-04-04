import {Injectable, NestMiddleware} from '@nestjs/common';
import {Request, Response, NextFunction} from 'express';
import {LogService} from './log.service';

@Injectable()
export class ApiLoggerMiddleware implements NestMiddleware {
    constructor(private readonly logService: LogService) {
    }

    use(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();
        const chunks: any[] = [];
        const originalSend = res.send;

        res.send = function (body: any) {
            chunks.push(body);
            return originalSend.call(this, body);
        };

        res.on('finish', async () => {
            const duration = Date.now() - start;
            const customerId = (req as any).user?.customer_id;

            const logData = {
                endpoint: req.originalUrl,
                method: req.method,
                request_body: req.body,
                request_headers: req.headers,
                response_body: chunks[0],
                status_code: res.statusCode,
                duration_ms: duration,
                customer_id: customerId,
                ip_address: req.ip,
            };

            try {
                await this.logService.logRequest(logData);
            } catch (err) {
                console.error('⚠️ Failed to save API log:', err);

                // Use fallback logError method to still capture the failure
                await this.logService.logError({
                    ...logData,
                    response_body: {error: 'Failed to log request'},
                });
            }
        });

        next();
    }
}