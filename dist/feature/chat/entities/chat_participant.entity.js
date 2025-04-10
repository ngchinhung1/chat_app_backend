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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatParticipantEntity = void 0;
const typeorm_1 = require("typeorm");
const chat_list_entity_1 = require("./chat_list.entity");
const user_entity_1 = require("../../auth/entities/user.entity");
let ChatParticipantEntity = class ChatParticipantEntity {
};
exports.ChatParticipantEntity = ChatParticipantEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ChatParticipantEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ChatParticipantEntity.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ChatParticipantEntity.prototype, "chat_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id', nullable: false }),
    __metadata("design:type", String)
], ChatParticipantEntity.prototype, "customer_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'member' }),
    __metadata("design:type", String)
], ChatParticipantEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChatParticipantEntity.prototype, "is_muted", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChatParticipantEntity.prototype, "is_archived", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChatParticipantEntity.prototype, "is_deleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ChatParticipantEntity.prototype, "last_read_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], ChatParticipantEntity.prototype, "joined_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chat_list_entity_1.ChatListEntity, (chat) => chat.participants),
    (0, typeorm_1.JoinColumn)({ name: 'chat_id' }),
    __metadata("design:type", chat_list_entity_1.ChatListEntity)
], ChatParticipantEntity.prototype, "chat", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { eager: false, nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.UserEntity)
], ChatParticipantEntity.prototype, "user", void 0);
exports.ChatParticipantEntity = ChatParticipantEntity = __decorate([
    (0, typeorm_1.Entity)('chat_participant')
], ChatParticipantEntity);
