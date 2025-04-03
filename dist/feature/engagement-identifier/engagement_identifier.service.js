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
exports.EngagementIdentifierService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const engagement_identifiers_entity_1 = require("./entities/engagement_identifiers.entity");
const base_response_1 = require("../../utils/base-response");
const _i18n_service_1 = require("../../i18n/ i18n.service");
let EngagementIdentifierService = class EngagementIdentifierService {
    constructor(engagementRepo, i18n) {
        this.engagementRepo = engagementRepo;
        this.i18n = i18n;
    }
    createOrUpdate(dto, language) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this.engagementRepo.findOne({
                where: {
                    deviceId: dto.deviceId,
                },
            });
            if (existing) {
                // Only update notificationToken
                yield this.engagementRepo.update(existing.id, { notificationToken: dto.notificationToken });
                return new base_response_1.BaseResponse(true, 200, null, this.i18n.getMessage(language, 'UPDATED_SUCCESSFULLY'));
            }
            // Create new engagement
            const engagement = this.engagementRepo.create(dto);
            yield this.engagementRepo.save(engagement);
            return new base_response_1.BaseResponse(true, 201, null, this.i18n.getMessage(language, 'CREATED_SUCCESSFULLY'));
        });
    }
    findByDeviceId(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.engagementRepo.findOne({
                where: { deviceId: deviceId },
            });
        });
    }
    updateDeviceInfo(dto, customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.engagementRepo.update({ deviceId: dto.deviceId }, {
                notificationToken: dto.notificationToken,
                advertisementId: dto.advertisementId,
                devicePlatform: dto.devicePlatform,
                customer_id: customerId,
            });
        });
    }
};
exports.EngagementIdentifierService = EngagementIdentifierService;
exports.EngagementIdentifierService = EngagementIdentifierService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(engagement_identifiers_entity_1.EngagementIdentifier)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        _i18n_service_1.I18nService])
], EngagementIdentifierService);
