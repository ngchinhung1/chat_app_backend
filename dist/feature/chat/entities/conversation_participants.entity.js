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
exports.ConversationParticipantsEntity = exports.ConversationParticipantRole = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../auth/entities/user.entity");
const conversation_entity_1 = require("./conversation.entity");
var ConversationParticipantRole;
(function (ConversationParticipantRole) {
    ConversationParticipantRole["ADMIN"] = "admin";
    ConversationParticipantRole["MEMBER"] = "member";
})(ConversationParticipantRole || (exports.ConversationParticipantRole = ConversationParticipantRole = {}));
let ConversationParticipantsEntity = class ConversationParticipantsEntity {
};
exports.ConversationParticipantsEntity = ConversationParticipantsEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConversationParticipantsEntity.prototype, "participantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => conversation_entity_1.ConversationEntity, (conversation) => conversation.participants, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'conversation_id' }),
    __metadata("design:type", conversation_entity_1.ConversationEntity)
], ConversationParticipantsEntity.prototype, "conversation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversation_id' }),
    __metadata("design:type", String)
], ConversationParticipantsEntity.prototype, "conversationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.UserEntity)
], ConversationParticipantsEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], ConversationParticipantsEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", String)
], ConversationParticipantsEntity.prototype, "customerID", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ConversationParticipantRole,
        default: ConversationParticipantRole.MEMBER,
    }),
    __metadata("design:type", String)
], ConversationParticipantsEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], ConversationParticipantsEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], ConversationParticipantsEntity.prototype, "createdAt", void 0);
exports.ConversationParticipantsEntity = ConversationParticipantsEntity = __decorate([
    (0, typeorm_1.Entity)('conversation_participants')
], ConversationParticipantsEntity);
