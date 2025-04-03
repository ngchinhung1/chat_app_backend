import {Controller, Post, Body, UseGuards, Req} from '@nestjs/common';
import {EngagementIdentifierService} from '../engagement-identifier/engagement_identifier.service';
import {Request} from 'express';
import {JwtAuthGuard} from "../../config/guards/jwtAuth.guard";
import {MobileSettingsDto} from "./dto/mobile_setting.dto";
import {BaseResponse} from "../../utils/base-response";
import {MobileSettingsService} from "./mobile_setting.service";
import {I18nService} from "../../i18n/ i18n.service";

@Controller('mobile-settings')
export class MobileSettingController {
    constructor(
        private readonly settingService: MobileSettingsService,
        private readonly engagementService: EngagementIdentifierService,
        private readonly i18n: I18nService,
    ) {
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async getSettings(@Body() body: MobileSettingsDto, @Req() req: Request) {
        const user: any = req.user;
        const language = Array.isArray(req.headers['language'])
            ? req.headers['language'][0]
            : req.headers['language'] || 'en';

        // ✅ Check & Update engagement_identifier
        const engagement = await this.engagementService.findByDeviceId(body.deviceId);
        if (engagement) {
            await this.engagementService.updateDeviceInfo(body, user.customer_id);
        }

        // ✅ Fetch settings
        const settings = await this.settingService.getSettingByPlatform(body.devicePlatform);

        if (!settings) {
            return new BaseResponse(true, 200, {
                link: null,
                devicePlatform: null,
                mobile_version: null,
                major_update: false,
                is_maintenance: false,
            }, this.i18n.getMessage(language, 'NO_SETTINGS_CONFIGURED'));
        }

        return new BaseResponse(true, 200, {
            link: settings.link,
            devicePlatform: settings.devicePlatform,
            mobile_version: settings.mobileVersion,
            major_update: settings.majorUpdate,
            is_maintenance: settings.isMaintenance,
        }, this.i18n.getMessage(language, 'MOBILE_SETTINGS_FETCHED_SUCCESSFULLY'));
    }
}