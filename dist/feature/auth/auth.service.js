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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const otp_verification_entity_1 = require("./entities/otp_verification.entity");
const user_entity_1 = require("./entities/user.entity");
const base_response_1 = require("../../utils/base-response");
const engagement_identifiers_entity_1 = require("../engagement-identifier/entities/engagement_identifiers.entity");
const _i18n_service_1 = require("../../i18n/ i18n.service");
const country_mapping_1 = require("../../utils/country-mapping");
let AuthService = class AuthService {
    constructor(otpRepo, userRepo, jwtService, engagementRepo, i18n) {
        this.otpRepo = otpRepo;
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.engagementRepo = engagementRepo;
        this.i18n = i18n;
    }
    requestOtp(dto, language) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!dto.countryCode || !dto.phoneNumber) {
                return new base_response_1.BaseResponse(false, 400, null, this.i18n.getMessage(language, 'COUNTRY_PHONE_EMPTY'));
            }
            // ✅ Sanitize countryCode
            const countryCode = dto.countryCode.replace(/^\+/, '');
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpEntity = this.otpRepo.create({
                phone_number: dto.phoneNumber,
                country_code: countryCode,
                otp: otp,
                device_id: dto.deviceId,
                devicePlatform: dto.devicePlatform,
                device_model: dto.deviceModel,
                expires_at: new Date(Date.now() + 5 * 60 * 1000), // OTP valid for 5 minutes
            });
            yield this.otpRepo.save(otpEntity);
            return new base_response_1.BaseResponse(true, 200, {
                countryCode: countryCode,
                phoneNumber: dto.phoneNumber,
                otp: otp,
            }, this.i18n.getMessage(language, 'OTP_REQUESTED_SUCCESSFULLY'));
        });
    }
    verifyOtp(dto, language) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // ✅ 1. Validate input
            if (!dto.countryCode || !dto.phoneNumber) {
                return new base_response_1.BaseResponse(false, 400, null, this.i18n.getMessage(language, 'COUNTRY_CODE_EMPTY'));
            }
            const countryCode = dto.countryCode.replace(/^\+/, '');
            const now = new Date();
            // ✅ 2. Find OTP record
            const otpRecord = yield this.otpRepo.findOne({
                where: {
                    phone_number: dto.phoneNumber,
                    country_code: countryCode,
                    otp: dto.otp,
                },
            });
            if (!otpRecord) {
                return new base_response_1.BaseResponse(false, 400, null, this.i18n.getMessage(language, 'INVALID_OTP'));
            }
            if (otpRecord.expires_at && otpRecord.expires_at < now) {
                return new base_response_1.BaseResponse(false, 400, null, this.i18n.getMessage(language, 'OTP_EXPIRED'));
            }
            // ✅ 3. Define device/app info (used in both register & login)
            const deviceInfo = {
                device_id: dto.deviceId,
                device_model: dto.deviceModel,
                devicePlatform: dto.devicePlatform,
                language: dto.language,
                app_version: dto.appVersion,
                is_google_play: dto.isGooglePlay,
            };
            // ✅ 4. Check if user exists
            let user = yield this.userRepo.findOne({
                where: {
                    phone_number: dto.phoneNumber,
                    country_code: countryCode,
                },
            });
            let isNewUser = false;
            if (!user) {
                // ✅ Register new user
                const customerId = yield this.generateNextCustomerId();
                user = this.userRepo.create(Object.assign({ phone_number: dto.phoneNumber, country_code: countryCode, customer_id: customerId, country: (0, country_mapping_1.getCountryNameByCode)(countryCode) }, deviceInfo));
                yield this.userRepo.save(user);
                isNewUser = true;
                // ✅ Update engagement_identifiers: isRegistered = true, add customer_id
                const engagement = yield this.engagementRepo.findOne({ where: { deviceId: dto.deviceId } });
                if (engagement) {
                    this.engagementRepo.merge(engagement, {
                        isRegistered: true,
                        customer_id: customerId,
                    });
                    yield this.engagementRepo.save(engagement);
                }
            }
            else {
                // ✅ Existing user: update login device info
                this.userRepo.merge(user, deviceInfo);
                yield this.userRepo.save(user);
                // ✅ Update engagement_identifiers: isLogin = true
                const engagement = yield this.engagementRepo.findOne({ where: { deviceId: dto.deviceId } });
                if (engagement) {
                    this.engagementRepo.merge(engagement, {
                        isLogin: true,
                    });
                    yield this.engagementRepo.save(engagement);
                }
            }
            // ✅ 5. Generate JWT token
            const token = this.jwtService.sign({
                sub: user.customer_id,
                phone: user.phone_number,
            }, {
                secret: process.env.JWT_SECRET,
                expiresIn: '7d',
            });
            // ✅ 6. Return response
            return new base_response_1.BaseResponse(true, 200, {
                country_code: user.country_code,
                phone_number: user.phone_number,
                token,
                customer_id: user.customer_id,
                name: (_a = user.name) !== null && _a !== void 0 ? _a : '',
                is_user: isNewUser,
                country: (0, country_mapping_1.getCountryNameByCode)(user.country_code),
            }, this.i18n.getMessage(language, isNewUser ? 'REGISTER_SUCCESS' : 'LOGIN_SUCCESS'));
        });
    }
    generateNextCustomerId() {
        return __awaiter(this, void 0, void 0, function* () {
            const lastUser = yield this.userRepo.createQueryBuilder('user')
                .orderBy('user.customer_id', 'DESC')
                .getOne();
            return lastUser
                ? (parseInt(lastUser.customer_id) + 1).toString()
                : '100000';
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(otp_verification_entity_1.OtpVerification)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(engagement_identifiers_entity_1.EngagementIdentifier)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        typeorm_2.Repository,
        _i18n_service_1.I18nService])
], AuthService);
