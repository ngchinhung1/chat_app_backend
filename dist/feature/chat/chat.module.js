"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const chat_gateway_1 = require("./chat.gateway");
const fcm_module_1 = require("../../fcm/fcm.module");
const chat_service_1 = require("./chat.service");
const typeorm_1 = require("@nestjs/typeorm");
const chat_participant_entity_1 = require("./entities/chat_participant.entity");
const message_entity_1 = require("./entities/message.entity");
const chat_list_entity_1 = require("./entities/chat_list.entity");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([chat_participant_entity_1.ChatParticipantEntity, message_entity_1.MessageEntity, chat_list_entity_1.ChatListEntity]),
            jwt_1.JwtModule.register({}),
            config_1.ConfigModule,
            fcm_module_1.FcmModule,
        ],
        providers: [chat_gateway_1.ChatGateway, chat_service_1.ChatService],
        exports: [chat_gateway_1.ChatGateway],
    })
], ChatModule);
