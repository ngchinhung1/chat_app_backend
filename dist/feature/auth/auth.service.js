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
const base_response_1 = require("../../utils/base-response");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const otp_verification_entity_1 = require("./entities/otp_verification.entity");
const user_entity_1 = require("./entities/user.entity");
const engagement_identifiers_entity_1 = require("../engagement-identifier/entities/engagement_identifiers.entity");
let AuthService = class AuthService {
    constructor(userRepo, otpRepo, engagementRepo) {
        this.userRepo = userRepo;
        this.otpRepo = otpRepo;
        this.engagementRepo = engagementRepo;
    }
    requestOtp(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate input
            if (!dto.countryCode || !dto.phoneNumber) {
                throw new Error('Country code and phone number cannot be null or empty');
            }
            // Remove leading '+' from countryCode, if present
            const sanitizedCountryCode = dto.countryCode.replace(/^\+/, '');
            // Concatenate country code and phone number to create customerId
            const customerId = `${sanitizedCountryCode}${dto.phoneNumber}`;
            // Check if user exists
            const existingUser = yield this.userRepo.findOne({
                where: { customer_id: customerId },
            });
            // Generate a 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            // Create OTP verification record
            const otpRecord = this.otpRepo.create({
                country_code: sanitizedCountryCode,
                phone_number: dto.phoneNumber,
                otp,
                expires_at: new Date(Date.now() + 5 * 60 * 1000), // Expires in 5 minutes
            });
            // Save OTP verification record
            yield this.otpRepo.save(otpRecord);
            // Return response
            return base_response_1.BaseResponse.success({
                is_user: !!existingUser,
                otp,
            }, 'OTP sent successfully');
        });
    }
    verifyOtp(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const customerId = `${dto.countryCode}${dto.phoneNumber}`;
            const otpRecord = yield this.otpRepo.findOne({
                where: {
                    country_code: dto.countryCode,
                    phone_number: dto.phoneNumber,
                    otp: dto.otp,
                },
            });
            if (!otpRecord) {
                return base_response_1.BaseResponse.error('Invalid OTP', 400);
            }
            let user = yield this.userRepo.findOne({
                where: {
                    phone_number: dto.phoneNumber,
                    country_code: dto.countryCode,
                },
            });
            if (!user) {
                const nextCustomerId = yield this.generateNextCustomerId();
                user = this.userRepo.create({
                    customer_id: nextCustomerId,
                    phone_number: dto.phoneNumber,
                    country_code: dto.countryCode,
                });
                yield this.userRepo.save(user);
            }
            yield this.engagementRepo.update({ customer_id: customerId }, { isRegistered: true });
            return base_response_1.BaseResponse.success({
                phone_number: `${dto.countryCode}${dto.phoneNumber}`,
                customer_id: user.customer_id,
            }, 'OTP verified successfully');
        });
    }
    generateNextCustomerId() {
        return __awaiter(this, void 0, void 0, function* () {
            const lastUser = yield this.userRepo.findOne({
                where: {},
                order: { customer_id: 'DESC' },
            });
            return lastUser ? (parseInt(lastUser.customer_id) + 1).toString() : '100000';
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(otp_verification_entity_1.OtpVerification)),
    __param(2, (0, typeorm_1.InjectRepository)(engagement_identifiers_entity_1.EngagementIdentifier)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuthService);
