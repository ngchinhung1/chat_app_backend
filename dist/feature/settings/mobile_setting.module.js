"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileSettingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const mobile_setting_service_1 = require("./mobile_setting.service");
const engagement_identifier_module_1 = require("../engagement-identifier/engagement_identifier.module");
const mobile_setting_controller_1 = require("./mobile_setting.controller");
const mobile_setting_entity_1 = require("./entities/mobile_setting.entity");
const _i18n_service_1 = require("../../i18n/ i18n.service");
const user_entity_1 = require("../auth/entities/user.entity");
let MobileSettingModule = class MobileSettingModule {
};
exports.MobileSettingModule = MobileSettingModule;
exports.MobileSettingModule = MobileSettingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([mobile_setting_entity_1.MobileSetting, user_entity_1.User]),
            engagement_identifier_module_1.EngagementIdentifierModule,
        ],
        controllers: [mobile_setting_controller_1.MobileSettingController],
        providers: [mobile_setting_service_1.MobileSettingsService, _i18n_service_1.I18nService],
    })
], MobileSettingModule);
