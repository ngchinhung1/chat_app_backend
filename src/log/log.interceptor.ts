import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import {Observable, catchError, map, of} from 'rxjs';
import {Request, Response} from 'express';
import {I18nService} from "../i18n/ i18n.service";
import {LogService} from "./log.service";

@Injectable()
export class ApiLoggerInterceptor implements NestInterceptor {
    constructor(
        private readonly logService: LogService,
        private readonly i18n: I18nService,
    ) {
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now();

        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const {method, originalUrl, headers, body, ip, user} = request;
        const customerId = user?.customer_id ?? undefined;
        const rawLang = request.headers['language'] ?? request.body?.language;
        const language = Array.isArray(rawLang) ? rawLang[0] : rawLang ?? 'en';

        return next.handle().pipe(
            map((data) => {
                const duration = Date.now() - now;

                // ✅ Mutate response data (example: format name)
                if (data && typeof data === 'object' && data?.data?.name) {
                    data.data.name = String(data.data.name).trim();
                }

                // ✅ Strip sensitive fields if present
                if (data && typeof data === 'object') {
                    if ('password' in data) delete data.password;
                    if ('token' in data) delete data.token;
                    if ('accessToken' in data) delete data.accessToken;
                }

                // ✅ Wrap in standard format if not already
                const isAlreadyWrapped = data && typeof data === 'object' && 'status' in data && 'code' in data && 'data' in data && 'msg' in data;
                const wrappedData = isAlreadyWrapped
                    ? {...data, performance_ms: data.performance_ms ?? duration}
                    : {
                        status: true,
                        code: response.statusCode,
                        data,
                        msg: this.i18n.getMessage(language, 'SUCCESS'),
                        performance_ms: duration,
                    };

                this.logService.logRequest({
                    endpoint: originalUrl,
                    method,
                    request_headers: headers,
                    request_body: body,
                    response_body: wrappedData,
                    status_code: response.statusCode,
                    duration_ms: duration,
                    customer_id: customerId,
                    ip_address: ip,
                }).catch((error: unknown) => {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.logService.logError({
                        endpoint: originalUrl,
                        method,
                        request_headers: headers,
                        request_body: body,
                        response_body: {error: errorMessage},
                        status_code: 500,
                        duration_ms: duration,
                        customer_id: customerId,
                        ip_address: ip,
                    }).then(() => null);
                });

                return wrappedData;
            }),
            catchError((error: unknown) => {
                console.error('Unexpected error:', error);
                const duration = Date.now() - now;
                const errorMessage = error instanceof Error ? error.message : String(error);

                this.logService.logError({
                    endpoint: originalUrl,
                    method,
                    request_headers: headers,
                    request_body: body,
                    response_body: {error: errorMessage},
                    status_code: 500,
                    duration_ms: duration,
                    customer_id: customerId,
                    ip_address: ip,
                }).then(() => null);

                return of({
                    status: false,
                    code: 500,
                    data: null,
                    msg: this.i18n.getMessage(language, 'UNKNOWN_ERROR'),
                    performance_ms: duration,
                });
            })
        );
    }
}