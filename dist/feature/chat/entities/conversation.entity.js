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
exports.ConversationEntity = exports.ConversationType = void 0;
const typeorm_1 = require("typeorm");
const conversation_participants_entity_1 = require("./conversation_participants.entity");
var ConversationType;
(function (ConversationType) {
    ConversationType["PRIVATE"] = "private";
    ConversationType["GROUP"] = "group";
})(ConversationType || (exports.ConversationType = ConversationType = {}));
let ConversationEntity = class ConversationEntity {
};
exports.ConversationEntity = ConversationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConversationEntity.prototype, "conversationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ConversationType, default: ConversationType.PRIVATE }),
    __metadata("design:type", String)
], ConversationEntity.prototype, "conversationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], ConversationEntity.prototype, "senderCustomerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], ConversationEntity.prototype, "senderUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], ConversationEntity.prototype, "receiverCustomerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], ConversationEntity.prototype, "receiverUserId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => conversation_participants_entity_1.ConversationParticipantsEntity, (participant) => participant.conversation, { cascade: true }),
    __metadata("design:type", Array)
], ConversationEntity.prototype, "participants", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], ConversationEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], ConversationEntity.prototype, "updatedAt", void 0);
exports.ConversationEntity = ConversationEntity = __decorate([
    (0, typeorm_1.Entity)('conversations')
], ConversationEntity);
