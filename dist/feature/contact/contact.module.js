"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const contact_entity_1 = require("./entities/contact.entity");
const contact_service_1 = require("./contact.service");
const contact_controller_1 = require("./contact.controller");
const user_entity_1 = require("../auth/entities/user.entity");
const chat_module_1 = require("../chat/chat.module");
const _i18n_service_1 = require("../../i18n/ i18n.service");
let ContactModule = class ContactModule {
};
exports.ContactModule = ContactModule;
exports.ContactModule = ContactModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([contact_entity_1.Contact, user_entity_1.UserEntity]),
            chat_module_1.ChatModule,
        ],
        providers: [contact_service_1.ContactService, _i18n_service_1.I18nService],
        controllers: [contact_controller_1.ContactController],
    })
], ContactModule);
