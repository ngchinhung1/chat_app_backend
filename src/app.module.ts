import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from '@nestjs/config';
import {AuthModule} from './feature/auth/auth.module';
import {ChatModule} from './feature/chat/chat.module';
import {EngagementIdentifierModule} from "./feature/engagement-identifier/engagement_identifier.module";
import {MobileSettingModule} from "./feature/settings/mobile_setting.module";
import {LanguageMiddleware} from "./middleware/language.middleware";
import {ProfileModule} from "./feature/profile/profile.module";
import {StorageModule} from "./shared/storage/storage.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
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
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LanguageMiddleware)
            .forRoutes({path: '*', method: RequestMethod.ALL});
    }
}