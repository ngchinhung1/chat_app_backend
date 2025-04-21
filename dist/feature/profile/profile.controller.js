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
exports.ProfileController = void 0;
const common_1 = require("@nestjs/common");
const profile_service_1 = require("./profile.service");
const updateProfile_dto_1 = require("./dto/updateProfile.dto");
const jwtAuth_guard_1 = require("../../config/guards/jwtAuth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const _i18n_service_1 = require("../../i18n/ i18n.service");
const editProfile_dto_1 = require("./dto/editProfile.dto");
let ProfileController = class ProfileController {
    constructor(profileService, i18n) {
        this.profileService = profileService;
        this.i18n = i18n;
    }
    updateProfile(dto, req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.profileService.updateProfile(dto, req.language);
        });
    }
    uploadProfileImage(file, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const imageUrl = yield this.profileService.uploadProfileImage(file);
            const language = req.headers['language'] || 'en';
            return {
                status: true,
                code: 200,
                data: {
                    image_url: imageUrl,
                },
                msg: this.i18n.getMessage(language, 'IMAGE_UPLOADED_SUCCESSFULLY'),
            };
        });
    }
    editProfile(dto, file, req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const ownerId = req.user.customer_id;
            const language = req.headers['language'] || 'en';
            dto.customer_id = ownerId;
            try {
                if (file) {
                    dto.profile_image = yield this.profileService.uploadProfileImage(file);
                }
                return yield this.profileService.editProfile(dto, language);
            }
            catch (error) {
                return {
                    status: false,
                    code: 400,
                    data: null,
                    msg: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.msg) ||
                        this.i18n.getMessage(language, 'USER_NOT_FOUND_CALL_FOR_DOWNLOAD_APP'),
                };
            }
        });
    }
    getProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const customer_id = req.user.customer_id;
            const language = req.headers['language'] || 'en';
            try {
                return yield this.profileService.getProfile(customer_id, language);
            }
            catch (error) {
                return {
                    status: false,
                    code: 400,
                    data: null,
                    msg: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.msg) ||
                        this.i18n.getMessage(language, 'PROFILE_FETCH_FAILED'),
                };
            }
        });
    }
};
exports.ProfileController = ProfileController;
__decorate([
    (0, common_1.Post)('update-profile'),
    (0, common_1.UseGuards)(jwtAuth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateProfile_dto_1.UpdateProfileDto, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('upload-profile-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "uploadProfileImage", null);
__decorate([
    (0, common_1.Post)('edit-profile'),
    (0, common_1.UseGuards)(jwtAuth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [editProfile_dto_1.EditProfileDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "editProfile", null);
__decorate([
    (0, common_1.Post)('get-profile'),
    (0, common_1.UseGuards)(jwtAuth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "getProfile", null);
exports.ProfileController = ProfileController = __decorate([
    (0, common_1.Controller)('profile'),
    __metadata("design:paramtypes", [profile_service_1.ProfileService,
        _i18n_service_1.I18nService])
], ProfileController);
