import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {AuthModule} from './feature/auth/auth.module';
import {ChatModule} from './feature/chat/chat.module';
import {EngagementIdentifierModule} from "./feature/engagement-identifier/engagement_identifier.module";
import {MobileSettingModule} from "./feature/settings/mobile_setting.module";
import {ProfileModule} from "./feature/profile/profile.module";
import {StorageModule} from "./shared/storage/storage.module";
import {LogModule} from "./log/log.module";
import {ApiLoggerMiddleware} from "./log/api-logger.middleware";
import {ApiLoggerInterceptor} from "./log/log.interceptor";
import {I18nModule} from "./i18n/i18n.module";
import {JwtModule} from "@nestjs/jwt";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        JwtModule.registerAsync({
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {expiresIn: '7d'},
            }),
            inject: [ConfigService],
        }),

        TypeOrmModule.forRoot({
            type: process.env.DB_TYPE as any,
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT) || 3306,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true, // Turn off in production!
        }),

        AuthModule,
        ChatModule,
        EngagementIdentifierModule,
        MobileSettingModule,
        ProfileModule,
        StorageModule,
        LogModule,
        I18nModule,
    ],
    providers: [
        ApiLoggerInterceptor,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ApiLoggerMiddleware).forRoutes('*');
    }
}