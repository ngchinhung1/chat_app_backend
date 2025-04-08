"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./feature/auth/auth.module");
const chat_module_1 = require("./feature/chat/chat.module");
const engagement_identifier_module_1 = require("./feature/engagement-identifier/engagement_identifier.module");
const mobile_setting_module_1 = require("./feature/settings/mobile_setting.module");
const profile_module_1 = require("./feature/profile/profile.module");
const storage_module_1 = require("./shared/storage/storage.module");
const log_module_1 = require("./log/log.module");
const api_logger_middleware_1 = require("./log/api-logger.middleware");
const log_interceptor_1 = require("./log/log.interceptor");
const i18n_module_1 = require("./i18n/i18n.module");
const jwt_1 = require("@nestjs/jwt");
const voice_upload_module_1 = require("./feature/chat/voice-upload.module");
const contact_module_1 = require("./feature/contact/contact.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(api_logger_middleware_1.ApiLoggerMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            jwt_1.JwtModule.registerAsync({
                useFactory: (configService) => __awaiter(void 0, void 0, void 0, function* () {
                    return ({
                        secret: configService.get('JWT_SECRET'),
                        signOptions: { expiresIn: '7d' },
                    });
                }),
                inject: [config_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: process.env.DB_TYPE,
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT) || 3306,
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: true, // Turn off in production!
            }),
            auth_module_1.AuthModule,
            chat_module_1.ChatModule,
            engagement_identifier_module_1.EngagementIdentifierModule,
            mobile_setting_module_1.MobileSettingModule,
            profile_module_1.ProfileModule,
            storage_module_1.StorageModule,
            log_module_1.LogModule,
            i18n_module_1.I18nModule,
            voice_upload_module_1.VoiceUploadModule,
            contact_module_1.ContactModule,
        ],
        providers: [
            log_interceptor_1.ApiLoggerInterceptor,
        ],
    })
], AppModule);
