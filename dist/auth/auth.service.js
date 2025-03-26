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
const user_entity_1 = require("../entities/user.entity");
const typeorm_2 = require("typeorm");
const otpStore = new Map();
let AuthService = class AuthService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    register(registerDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { country_code, phone_number } = registerDto;
            const existingUser = yield this.userRepo.findOne({ where: { phone_number } });
            if (existingUser) {
                throw new common_1.BadRequestException('User already exists');
            }
            const newUser = this.userRepo.create({ country_code, phone_number });
            const user = yield this.userRepo.save(newUser);
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins expiry
            otpStore.set(phone_number, { otp, expiresAt });
            console.log(`OTP for ${phone_number}: ${otp}`); // For dev only
            return {
                message: 'OTP sent successfully',
                user_id: user.id,
                otp: otp, // remove in production
            };
        });
    }
    verify(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { phone_number, otp } = dto;
            const record = otpStore.get(phone_number);
            if (!record) {
                throw new common_1.BadRequestException('No OTP requested for this number');
            }
            if (Date.now() > record.expiresAt) {
                otpStore.delete(phone_number);
                throw new common_1.BadRequestException('OTP has expired');
            }
            if (otp !== record.otp) {
                throw new common_1.BadRequestException('Invalid OTP');
            }
            const user = yield this.userRepo.findOne({ where: { phone_number } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            user.is_verified = true;
            yield this.userRepo.save(user);
            otpStore.delete(phone_number);
            return { message: 'Phone number verified successfully' };
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuthService);
