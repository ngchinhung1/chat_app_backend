"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagementIdentifierModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const engagement_identifiers_entity_1 = require("./entities/engagement_identifiers.entity");
const engagement_identifier_service_1 = require("./engagement_identifier.service");
const engagement_identifier_controller_1 = require("./engagement_identifier.controller");
const _i18n_service_1 = require("../../i18n/ i18n.service");
let EngagementIdentifierModule = class EngagementIdentifierModule {
};
exports.EngagementIdentifierModule = EngagementIdentifierModule;
exports.EngagementIdentifierModule = EngagementIdentifierModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([engagement_identifiers_entity_1.EngagementIdentifier])],
        controllers: [engagement_identifier_controller_1.EngagementIdentifierController],
        providers: [engagement_identifier_service_1.EngagementIdentifierService, _i18n_service_1.I18nService],
        exports: [engagement_identifier_service_1.EngagementIdentifierService],
    })
], EngagementIdentifierModule);
