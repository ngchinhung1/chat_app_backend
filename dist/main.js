"use strict";
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
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = yield core_1.NestFactory.create(app_module_1.AppModule);
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
        yield app.listen(3000, '0.0.0.0');
        console.log('✅ Server running on http://localhost:3000');
    });
}
bootstrap();
