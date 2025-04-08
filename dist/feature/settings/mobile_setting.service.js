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
exports.MobileSettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const mobile_setting_entity_1 = require("./entities/mobile_setting.entity");
const user_entity_1 = require("../auth/entities/user.entity");
let MobileSettingsService = class MobileSettingsService {
    constructor(settingRepo, userRepo) {
        this.settingRepo = settingRepo;
        this.userRepo = userRepo;
    }
    upsertAndReturnUserSettings(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { customer_id, deviceId, devicePlatform, advertisementId, notificationToken, } = dto;
            // 1. Update user
            yield this.userRepo.update({ customer_id }, {
                deviceId,
                devicePlatform,
                advertisementId,
                notificationToken,
            });
            // 2. Load base mobile setting (based on platform)
            const setting = yield this.settingRepo.findOne({
                where: { devicePlatform },
                select: [
                    'link',
                    'mobileVersion',
                    'majorUpdate',
                    'isMaintenance',
                ],
            });
            return setting || {
                link: '',
                devicePlatform,
                mobile_version: '',
                major_update: false,
                is_maintenance: false,
            };
        });
    }
};
exports.MobileSettingsService = MobileSettingsService;
exports.MobileSettingsService = MobileSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(mobile_setting_entity_1.MobileSetting)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MobileSettingsService);
