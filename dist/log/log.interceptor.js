"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiLoggerInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const _i18n_service_1 = require("../i18n/ i18n.service");
const log_service_1 = require("./log.service");
let ApiLoggerInterceptor = class ApiLoggerInterceptor {
    constructor(logService, i18n) {
        this.logService = logService;
        this.i18n = i18n;
    }
    intercept(context, next) {
        var _a, _b, _c;
        const now = Date.now();
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const { method, originalUrl, headers, body, ip, user } = request;
        const customerId = (_a = user === null || user === void 0 ? void 0 : user.customer_id) !== null && _a !== void 0 ? _a : undefined;
        const rawLang = (_b = request.headers['language']) !== null && _b !== void 0 ? _b : (_c = request.body) === null || _c === void 0 ? void 0 : _c.language;
        const language = Array.isArray(rawLang) ? rawLang[0] : rawLang !== null && rawLang !== void 0 ? rawLang : 'en';
        return next.handle().pipe((0, rxjs_1.map)((data) => {
            var _a, _b;
            const duration = Date.now() - now;
            // ✅ Mutate response data (example: format name)
            if (data && typeof data === 'object' && ((_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a.name)) {
                data.data.name = String(data.data.name).trim();
            }
            // ✅ Strip sensitive fields if present
            if (data && typeof data === 'object') {
                if ('password' in data)
                    delete data.password;
                if ('token' in data)
                    delete data.token;
                if ('accessToken' in data)
                    delete data.accessToken;
            }
            // ✅ Wrap in standard format if not already
            const isAlreadyWrapped = data && typeof data === 'object' && 'status' in data && 'code' in data && 'data' in data && 'msg' in data;
            const wrappedData = isAlreadyWrapped
                ? Object.assign(Object.assign({}, data), { performance_ms: (_b = data.performance_ms) !== null && _b !== void 0 ? _b : duration }) : {
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
            }).catch((error) => {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logService.logError({
                    endpoint: originalUrl,
                    method,
                    request_headers: headers,
                    request_body: body,
                    response_body: { error: errorMessage },
                    status_code: 500,
                    duration_ms: duration,
                    customer_id: customerId,
                    ip_address: ip,
                });
            });
            return wrappedData;
        }), (0, rxjs_1.catchError)((error) => {
            const duration = Date.now() - now;
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logService.logError({
                endpoint: originalUrl,
                method,
                request_headers: headers,
                request_body: body,
                response_body: { error: errorMessage },
                status_code: 500,
                duration_ms: duration,
                customer_id: customerId,
                ip_address: ip,
            });
            return (0, rxjs_1.of)({
                status: false,
                code: 500,
                data: null,
                msg: this.i18n.getMessage(language, 'UNKNOWN_ERROR'),
                performance_ms: duration,
            });
        }));
    }
};
exports.ApiLoggerInterceptor = ApiLoggerInterceptor;
exports.ApiLoggerInterceptor = ApiLoggerInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [log_service_1.LogService,
        _i18n_service_1.I18nService])
], ApiLoggerInterceptor);
