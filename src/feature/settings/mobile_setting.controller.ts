import {Controller, Post, Body, UseGuards, Req} from '@nestjs/common';
import {JwtAuthGuard} from "../../config/guards/jwtAuth.guard";
import {MobileSettingsDto} from "./dto/mobile_setting.dto";
import {BaseResponse} from "../../utils/base-response";
import {MobileSettingsService} from "./mobile_setting.service";
import {I18nService} from "../../i18n/ i18n.service";
import {getLanguageFromHeaders} from "../../utils/language.util";

@Controller('mobile-settings')
export class MobileSettingController {
    constructor(
        private readonly settingService: MobileSettingsService,
        private readonly i18n: I18nService,
    ) {
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async upsertSettings(@Body() dto: MobileSettingsDto, @Req() req: Request) {
        const language = getLanguageFromHeaders(req);

        try {
            const data = await this.settingService.upsertAndReturnUserSettings(dto);

            if (!data) {
                // default fallback response
                return new BaseResponse(
                    true,
                    200,
                    {
                        link: null,
                        devicePlatform: null,
                        mobile_version: null,
                        major_update: false,
                        is_maintenance: false,
                    },
                    this.i18n.getMessage(language, 'NO_SETTINGS_CONFIGURED'),
                );
            }

            return new BaseResponse(
                true,
                200,
                {
                    link: data.link,
                    devicePlatform: data.devicePlatform,
                    mobile_version: data.mobileVersion,
                    major_update: data.majorUpdate,
                    is_maintenance: data.isMaintenance,
                },
                this.i18n.getMessage(language, 'MOBILE_SETTINGS_FETCHED_SUCCESSFULLY'),
            );
        } catch (error) {
            console.error('Mobile settings error:', error);
            return new BaseResponse(
                false,
                500,
                null,
                this.i18n.getMessage(language, 'UNEXPECTED_ERROR'),
            );
        }
    }
}