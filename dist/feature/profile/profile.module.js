"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const profile_controller_1 = require("./profile.controller");
const profile_service_1 = require("./profile.service");
const profile_entity_1 = require("./entities/profile.entity");
const _i18n_service_1 = require("../../i18n/ i18n.service");
const s3_storage_service_1 = require("../../shared/storage/s3-storage.service");
const local_storage_service_1 = require("../../shared/storage/local-storage.service");
const uploaded_files_entity_1 = require("../../shared/entities/uploaded_files.entity");
const user_entity_1 = require("../auth/entities/user.entity");
let ProfileModule = class ProfileModule {
};
exports.ProfileModule = ProfileModule;
exports.ProfileModule = ProfileModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([profile_entity_1.Profile, uploaded_files_entity_1.UploadedFile, user_entity_1.User])],
        controllers: [profile_controller_1.ProfileController],
        providers: [profile_service_1.ProfileService, _i18n_service_1.I18nService, s3_storage_service_1.S3StorageService, local_storage_service_1.LocalStorageService],
        exports: [profile_service_1.ProfileService],
    })
], ProfileModule);
