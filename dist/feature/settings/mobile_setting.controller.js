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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.MobileSettingController = void 0;
const common_1 = require("@nestjs/common");
const engagement_identifier_service_1 = require("../engagement-identifier/engagement_identifier.service");
const jwtAuth_guard_1 = require("../../config/guards/jwtAuth.guard");
const mobile_setting_dto_1 = require("./dto/mobile_setting.dto");
const base_response_1 = require("../../utils/base-response");
const mobile_setting_service_1 = require("./mobile_setting.service");
const _i18n_service_1 = require("../../i18n/ i18n.service");
let MobileSettingController = class MobileSettingController {
    constructor(settingService, engagementService, i18n) {
        this.settingService = settingService;
        this.engagementService = engagementService;
        this.i18n = i18n;
    }
    getSettings(body, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const language = Array.isArray(req.headers['language'])
                ? req.headers['language'][0]
                : req.headers['language'] || 'en';
            // ✅ Check & Update engagement_identifier
            const engagement = yield this.engagementService.findByDeviceId(body.deviceId);
            if (engagement) {
                yield this.engagementService.updateDeviceInfo(body, user.customer_id);
            }
            // ✅ Fetch settings
            const settings = yield this.settingService.getSettingByPlatform(body.devicePlatform);
            if (!settings) {
                return new base_response_1.BaseResponse(true, 200, {
                    link: null,
                    mobile_version: null,
                    major_update: false,
                    is_maintenance: false,
                }, this.i18n.getMessage(language, 'NO_SETTINGS_CONFIGURED'));
            }
            return new base_response_1.BaseResponse(true, 200, {
                link: settings.link,
                mobile_version: settings.mobileVersion,
                major_update: settings.majorUpdate,
                is_maintenance: settings.isMaintenance,
            }, this.i18n.getMessage(language, 'MOBILE_SETTINGS_FETCHED_SUCCESSFULLY'));
        });
    }
};
exports.MobileSettingController = MobileSettingController;
__decorate([
    (0, common_1.UseGuards)(jwtAuth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mobile_setting_dto_1.MobileSettingsDto, Object]),
    __metadata("design:returntype", Promise)
], MobileSettingController.prototype, "getSettings", null);
exports.MobileSettingController = MobileSettingController = __decorate([
    (0, common_1.Controller)('mobile-settings'),
    __metadata("design:paramtypes", [mobile_setting_service_1.MobileSettingsService,
        engagement_identifier_service_1.EngagementIdentifierService,
        _i18n_service_1.I18nService])
], MobileSettingController);
