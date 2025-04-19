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
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const base_response_1 = require("../../utils/base-response");
const profile_entity_1 = require("./entities/profile.entity");
const _i18n_service_1 = require("../../i18n/ i18n.service");
const uploaded_files_entity_1 = require("../../shared/entities/uploaded_files.entity");
const user_entity_1 = require("../auth/entities/user.entity");
const storage_service_1 = require("../../shared/storage/storage.service");
let ProfileService = class ProfileService {
    constructor(profileRepo, i18n, uploadedFileRepo, userRepo, storageService) {
        this.profileRepo = profileRepo;
        this.i18n = i18n;
        this.uploadedFileRepo = uploadedFileRepo;
        this.userRepo = userRepo;
        this.storageService = storageService;
    }
    updateProfile(dto, language) {
        return __awaiter(this, void 0, void 0, function* () {
            let profile = yield this.profileRepo.findOne({
                where: { customer_id: dto.customer_id },
            });
            if (!profile) {
                // Create new profile
                profile = this.profileRepo.create({
                    customer_id: dto.customer_id,
                    first_name: dto.first_name,
                    last_name: dto.last_name,
                    profile_image: dto.profile_image,
                    status_message: dto.status_message,
                    description: dto.description,
                    is_active: dto.is_active !== undefined ? dto.is_active : true,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
                yield this.profileRepo.save(profile);
                // Also update Users table
                yield this.userRepo.update({ customer_id: dto.customer_id }, {
                    first_name: dto.first_name,
                    last_name: dto.last_name,
                    profile_image: dto.profile_image
                });
                return new base_response_1.BaseResponse(true, 201, {
                    customer_id: profile.customer_id,
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    profile_image: profile.profile_image,
                    status_message: profile.status_message,
                    description: profile.description,
                    is_active: profile.is_active,
                    created_at: profile.created_at,
                    updated_at: profile.updated_at,
                }, this.i18n.getMessage(language, 'USER_PROFILE_CREATED_SUCCESSFULLY'));
            }
            else {
                // Update existing
                profile.first_name = dto.first_name || profile.first_name;
                profile.last_name = dto.last_name || profile.last_name;
                profile.profile_image = dto.profile_image || profile.profile_image;
                profile.status_message = dto.status_message || profile.status_message;
                profile.description = dto.description || profile.description;
                profile.is_active = dto.is_active !== undefined ? dto.is_active : profile.is_active;
                profile.updated_at = new Date();
                yield this.profileRepo.save(profile);
                // Update Users table name
                if (dto.first_name && dto.last_name) {
                    yield this.userRepo.update({ customer_id: dto.customer_id }, {
                        first_name: dto.first_name,
                        last_name: dto.last_name,
                        profile_image: dto.profile_image
                    });
                }
                return new base_response_1.BaseResponse(true, 200, {
                    customer_id: profile.customer_id,
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    profile_image: profile.profile_image,
                    status_message: profile.status_message,
                    description: profile.description,
                    is_active: profile.is_active,
                    updated_at: profile.updated_at,
                }, this.i18n.getMessage(language, 'USER_PROFILE_UPDATED_SUCCESSFULLY'));
            }
        });
    }
    uploadProfileImage(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const imageUrl = yield this.storageService.upload(file);
            // Save to uploaded_files table
            yield this.uploadedFileRepo.save({
                path: imageUrl,
            });
            return imageUrl;
        });
    }
    editProfile(dto, language) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Verify user exists
            const user = yield this.userRepo.findOne({
                where: { customer_id: dto.customer_id },
            });
            if (!user) {
                throw new common_1.HttpException({
                    status: false,
                    msg: this.i18n.getMessage(language, 'USER_NOT_FOUND'),
                    code: 400,
                    data: {},
                }, 400);
            }
            user.first_name = dto.first_name;
            user.last_name = dto.last_name;
            user.profile_image = dto.profile_image;
            yield this.userRepo.save(user);
            // 2. Load or create profile record
            let profile = yield this.profileRepo.findOne({
                where: { customer_id: dto.customer_id },
            });
            if (!profile) {
                profile = this.profileRepo.create({ customer_id: dto.customer_id });
            }
            // 3. Assign new values
            profile.first_name = dto.first_name;
            profile.last_name = dto.last_name;
            profile.profile_image = dto.profile_image;
            // 4. Persist
            profile = yield this.profileRepo.save(profile);
            return {
                status: true,
                code: 200,
                data: {
                    customer_id: profile.customer_id,
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    profile_image: profile.profile_image,
                    updated_at: profile.updated_at,
                },
                msg: this.i18n.getMessage(language, 'USER_PROFILE_UPDATED_SUCCESSFULLY'),
            };
        });
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(profile_entity_1.Profile)),
    __param(2, (0, typeorm_1.InjectRepository)(uploaded_files_entity_1.UploadedFile)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(4, (0, common_1.Inject)('StorageService')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        _i18n_service_1.I18nService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        storage_service_1.StorageService])
], ProfileService);
