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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const passport_1 = require("@nestjs/passport");
const register_request_dto_1 = require("./dto/register_request.dto");
const register_verify_dto_1 = require("./dto/register_verify.dto");
const updateProfile_dto_1 = require("../profile/dto/updateProfile.dto");
const login_verify_dto_1 = require("./dto/login_verify.dto");
const login_request_dto_1 = require("./dto/login_request.dto");
// ✅ Api Endpoints
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    // ✅ Register Route (Public)
    registerRequest(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.authService.registerRequest(dto);
        });
    }
    registerVerify(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.authService.registerVerify(dto);
        });
    }
    updateProfile(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.authService.updateProfile(dto);
        });
    }
    loginRequest(dto) {
        return this.authService.loginRequest(dto);
    }
    loginVerify(dto) {
        return this.authService.loginVerify(dto);
    }
    // ✅ Protected Route: Requires JWT authentication
    getProfile(req) {
        return { message: 'This route is protected', user: req.user };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register-request'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_request_dto_1.Register_requestDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerRequest", null);
__decorate([
    (0, common_1.Post)('register-verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_verify_dto_1.Register_verifyDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerVerify", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)('update-profile'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateProfile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('login-request'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_request_dto_1.LoginRequestDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "loginRequest", null);
__decorate([
    (0, common_1.Post)('login-verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_verify_dto_1.LoginVerifyDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "loginVerify", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
