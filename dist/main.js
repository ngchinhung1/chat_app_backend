"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const _i18n_service_1 = require("./i18n/ i18n.service");
const log_interceptor_1 = require("./log/log.interceptor");
const custom_io_adapter_1 = require("./types/custom-io.adapter");
const express = __importStar(require("express"));
const path_1 = require("path");
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = yield core_1.NestFactory.create(app_module_1.AppModule);
        app.use('/uploads', express.static((0, path_1.join)(__dirname, '..', 'uploads')));
        app.useWebSocketAdapter(new custom_io_adapter_1.CustomIoAdapter(app));
        const i18nService = app.get(_i18n_service_1.I18nService);
        app.useGlobalPipes(new common_1.ValidationPipe({
            exceptionFactory: (errors) => {
                const messages = errors.map((err) => {
                    var _a;
                    const lang = ((_a = err.target) === null || _a === void 0 ? void 0 : _a.language) || 'en';
                    const constraints = err.constraints
                        ? Object.values(err.constraints).map((msg) => {
                            if (msg.includes('country code')) {
                                return i18nService.getMessage(lang, 'COUNTRY_CODE_EMPTY');
                            }
                            if (msg.includes('phone number')) {
                                return i18nService.getMessage(lang, 'PHONE_NUMBER_EMPTY');
                            }
                            return msg;
                        })
                        : [];
                    return {
                        field: err.property,
                        errors: constraints,
                    };
                });
                return new common_1.BadRequestException(messages);
            },
            whitelist: true,
            transform: true,
        }));
        app.useGlobalInterceptors(app.get(log_interceptor_1.ApiLoggerInterceptor));
        yield app.listen(3000, '0.0.0.0');
        console.log('✅ Server running on http://localhost:3000');
    });
}
bootstrap().then(() => null);
