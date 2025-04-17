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
exports.ChatUploadController = void 0;
const common_1 = require("@nestjs/common");
const jwtAuth_guard_1 = require("../../config/guards/jwtAuth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const _i18n_service_1 = require("../../i18n/ i18n.service");
const chat_upload_service_1 = require("./chat-upload.service");
let ChatUploadController = class ChatUploadController {
    constructor(uploadService, i18n) {
        this.uploadService = uploadService;
        this.i18n = i18n;
    }
    uploadChatFile(file, req) {
        return __awaiter(this, void 0, void 0, function* () {
            // service handles saving to disk or S3, returns a public URL
            const fileUrl = yield this.uploadService.uploadChatFile(file);
            // pick up the language header if you need localized messages
            const language = req.headers['language'] || 'en';
            return {
                status: true,
                code: 200,
                data: {
                    file_url: fileUrl,
                },
                msg: this.i18n.getMessage(language, 'FILE_UPLOADED_SUCCESSFULLY'),
            };
        });
    }
};
exports.ChatUploadController = ChatUploadController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwtAuth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatUploadController.prototype, "uploadChatFile", null);
exports.ChatUploadController = ChatUploadController = __decorate([
    (0, common_1.Controller)('upload-file'),
    __metadata("design:paramtypes", [chat_upload_service_1.ChatUploadService,
        _i18n_service_1.I18nService])
], ChatUploadController);
