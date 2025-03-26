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
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../../entities/user.entity");
const typeorm_2 = require("typeorm");
const otp_verification_entity_1 = require("../../entities/otp_verification.entity");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    constructor(userRepo, otpRepo, jwtService) {
        this.userRepo = userRepo;
        this.otpRepo = otpRepo;
        this.jwtService = jwtService;
    }
    registerRequest(registerDto) {
        return __awaiter(this, void 0, void 0, function* () {
            let { country_code, phone_number } = registerDto;
            // 1. Validate input: Only digits allowed
            const digitOnly = /^\d+$/;
            // Strip '+' if exists (e.g. +60 → 60)
            country_code = country_code.replace('+', '');
            if (!digitOnly.test(country_code)) {
                throw new common_1.BadRequestException('country_code must contain digits only (no special characters)');
            }
            if (!digitOnly.test(phone_number)) {
                throw new common_1.BadRequestException('phone_number must contain digits only');
            }
            // 2. Check if user already exists
            const existingUser = yield this.userRepo.findOne({ where: { phone_number } });
            if (existingUser) {
                throw new common_1.BadRequestException('User already exists');
            }
            // 3. Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
            // 4. Save OTP entry
            yield this.otpRepo.save({
                phone_number,
                country_code, // sanitized version
                otp,
                expires_at: expiresAt,
                isVerified: false,
            });
            console.log(`Register OTP for +${country_code}${phone_number}: ${otp}`);
            return {
                message: 'OTP sent successfully',
                otp: otp, // remove in prod
            };
        });
    }
    registerVerify(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            let { country_code, phone_number, otp } = dto;
            country_code = country_code.replace('+', '');
            const digitOnly = /^\d+$/;
            if (!digitOnly.test(country_code)) {
                throw new common_1.BadRequestException('country_code must be digits only');
            }
            if (!digitOnly.test(phone_number)) {
                throw new common_1.BadRequestException('phone_number must be digits only');
            }
            const otpEntry = yield this.otpRepo.findOne({
                where: {
                    country_code,
                    phone_number,
                    otp,
                    isVerified: false,
                    expires_at: (0, typeorm_2.MoreThan)(new Date()),
                },
            });
            if (!otpEntry)
                throw new common_1.BadRequestException('Invalid or expired OTP');
            //Check if user already exists
            const existingUser = yield this.userRepo.findOne({
                where: { country_code, phone_number },
            });
            if (existingUser)
                throw new common_1.BadRequestException('User already exists');
            //Get latest customer_id
            const latestUser = yield this.userRepo
                .createQueryBuilder('user')
                .where('user.customer_id IS NOT NULL')
                .orderBy('user.customer_id', 'DESC')
                .getOne();
            const lastCustomerId = (latestUser === null || latestUser === void 0 ? void 0 : latestUser.customer_id)
                ? parseInt(latestUser.customer_id)
                : 1000000;
            const newCustomerId = (lastCustomerId + 1).toString();
            //Create new user
            const newUser = this.userRepo.create({
                country_code,
                phone_number,
                isVerified: true,
                customer_id: newCustomerId,
            });
            const user = yield this.userRepo.save(newUser);
            //Mark OTP as used
            otpEntry.isVerified = true;
            yield this.otpRepo.save(otpEntry);
            //Generate JWT
            const payload = { sub: user.customer_id, phone: user.phone_number };
            const token = this.jwtService.sign(payload);
            return {
                message: 'Phone number verified and user created successfully',
                token,
                customer_id: newCustomerId,
                country_code: user.country_code,
                phone_number: user.phone_number,
            };
        });
    }
    updateProfile(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { customer_id, name, profile_image } = dto;
            const user = yield this.userRepo.findOne({ where: { customer_id: customer_id } });
            if (!user)
                throw new common_1.NotFoundException('User not found');
            if (!user.isVerified)
                throw new common_1.BadRequestException('User is not verified');
            user.name = name;
            user.profile_image = profile_image || user.profile_image;
            yield this.userRepo.save(user);
            return { message: 'Profile updated successfully' };
        });
    }
    loginRequest(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            let { country_code, phone_number } = dto;
            // Sanitize
            country_code = country_code.replace('+', '');
            const digitOnly = /^\d+$/;
            if (!digitOnly.test(country_code) || !digitOnly.test(phone_number)) {
                throw new common_1.BadRequestException('Invalid country code or phone number');
            }
            // Find existing user
            const user = yield this.userRepo.findOne({ where: { country_code, phone_number } });
            if (!user || !user.isVerified) {
                throw new common_1.BadRequestException('User not found or not verified');
            }
            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
            // Save OTP
            yield this.otpRepo.save({
                phone_number,
                country_code,
                otp,
                expires_at: expiresAt,
                is_verified: false,
            });
            console.log(`Login OTP for +${country_code}${phone_number}: ${otp}`);
            return {
                message: 'OTP sent successfully for login',
                otp, // remove in prod
            };
        });
    }
    loginVerify(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            let { country_code, phone_number, otp } = dto;
            country_code = country_code.replace('+', '');
            const otpEntry = yield this.otpRepo.findOne({
                where: {
                    country_code,
                    phone_number,
                    otp,
                    isVerified: false,
                    expires_at: (0, typeorm_2.MoreThan)(new Date()),
                },
            });
            if (!otpEntry)
                throw new common_1.BadRequestException('Invalid or expired OTP');
            const user = yield this.userRepo.findOne({ where: { country_code, phone_number } });
            if (!user || !user.isVerified)
                throw new common_1.NotFoundException('User not found or not verified');
            otpEntry.isVerified = true;
            yield this.otpRepo.save(otpEntry);
            // JWT
            const payload = { sub: user.customer_id, phone: user.phone_number };
            const token = this.jwtService.sign(payload);
            return {
                message: 'Login successful',
                token,
                customer_id: user.customer_id,
                country_code: user.country_code,
                phone_number: user.phone_number,
            };
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(otp_verification_entity_1.OtpVerification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
