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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagementIdentifierController = void 0;
const common_1 = require("@nestjs/common");
const engagement_identifier_service_1 = require("./engagement_identifier.service");
const create_engagement_dto_1 = require("./dto/create-engagement.dto");
const update_engagement_dto_1 = require("./dto/update-engagement.dto");
const jwtAuthGuard_1 = require("../../config/guards/jwtAuthGuard");
let EngagementIdentifierController = class EngagementIdentifierController {
    constructor(engagementService) {
        this.engagementService = engagementService;
    }
    create(createDto) {
        return this.engagementService.create(createDto);
    }
    findAll() {
        return this.engagementService.findAll();
    }
    findOne(id) {
        return this.engagementService.findOne(id);
    }
    update(id, updateDto) {
        return this.engagementService.update(id, updateDto);
    }
    remove(id) {
        return this.engagementService.remove(id);
    }
};
exports.EngagementIdentifierController = EngagementIdentifierController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_engagement_dto_1.CreateEngagementDto]),
    __metadata("design:returntype", void 0)
], EngagementIdentifierController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EngagementIdentifierController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EngagementIdentifierController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_engagement_dto_1.UpdateEngagementDto]),
    __metadata("design:returntype", void 0)
], EngagementIdentifierController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EngagementIdentifierController.prototype, "remove", null);
exports.EngagementIdentifierController = EngagementIdentifierController = __decorate([
    (0, common_1.Controller)('engagement-identifiers'),
    (0, common_1.UseGuards)(jwtAuthGuard_1.WsJwtGuard),
    __metadata("design:paramtypes", [engagement_identifier_service_1.EngagementIdentifierService])
], EngagementIdentifierController);
