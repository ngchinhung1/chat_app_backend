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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiLoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
const log_service_1 = require("./log.service");
let ApiLoggerMiddleware = class ApiLoggerMiddleware {
    constructor(logService) {
        this.logService = logService;
    }
    use(req, res, next) {
        const start = Date.now();
        const chunks = [];
        const originalSend = res.send;
        res.send = function (body) {
            chunks.push(body);
            return originalSend.call(this, body);
        };
        res.on('finish', () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const duration = Date.now() - start;
            const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.customer_id;
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
                yield this.logService.logRequest(logData);
            }
            catch (err) {
                console.error('⚠️ Failed to save API log:', err);
                // Use fallback logError method to still capture the failure
                yield this.logService.logError(Object.assign(Object.assign({}, logData), { response_body: { error: 'Failed to log request' } }));
            }
        }));
        next();
    }
};
exports.ApiLoggerMiddleware = ApiLoggerMiddleware;
exports.ApiLoggerMiddleware = ApiLoggerMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [log_service_1.LogService])
], ApiLoggerMiddleware);
