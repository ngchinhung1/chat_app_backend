import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {MobileSettingsService} from "./mobile_setting.service";
import {EngagementIdentifierModule} from "../engagement-identifier/engagement_identifier.module";
import {MobileSettingController} from "./mobile_setting.controller";
import {MobileSetting} from "./entities/mobile_setting.entity";
import {I18nService} from "../../i18n/ i18n.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([MobileSetting]),
        EngagementIdentifierModule,
    ],
    controllers: [MobileSettingController],
    providers: [MobileSettingsService, I18nService],
})
export class MobileSettingModule {
}