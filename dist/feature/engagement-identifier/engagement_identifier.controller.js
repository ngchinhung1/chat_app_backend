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
exports.EngagementIdentifierController = void 0;
const common_1 = require("@nestjs/common");
const engagement_identifier_service_1 = require("./engagement_identifier.service");
const create_engagement_dto_1 = require("./dto/create-engagement.dto");
const api_key_guard_1 = require("../../config/guards/api-key.guard");
let EngagementIdentifierController = class EngagementIdentifierController {
    constructor(engagementService) {
        this.engagementService = engagementService;
    }
    createEngagement(dto, req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.engagementService.createOrUpdate(dto, req.language);
        });
    }
};
exports.EngagementIdentifierController = EngagementIdentifierController;
__decorate([
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, common_1.Post)('engagement-identifiers'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_engagement_dto_1.CreateEngagementDto, Object]),
    __metadata("design:returntype", Promise)
], EngagementIdentifierController.prototype, "createEngagement", null);
exports.EngagementIdentifierController = EngagementIdentifierController = __decorate([
    (0, common_1.Controller)('general'),
    __metadata("design:paramtypes", [engagement_identifier_service_1.EngagementIdentifierService])
], EngagementIdentifierController);
