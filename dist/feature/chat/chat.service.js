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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_participant_entity_1 = require("./entities/chat_participant.entity");
const message_entity_1 = require("./entities/message.entity");
const chat_list_entity_1 = require("./entities/chat_list.entity");
let ChatService = class ChatService {
    constructor(chatParticipantRepo, messageRepo, chatListRepo) {
        this.chatParticipantRepo = chatParticipantRepo;
        this.messageRepo = messageRepo;
        this.chatListRepo = chatListRepo;
    }
    getChatListForUser(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const participants = yield this.chatParticipantRepo.find({
                where: { user_id: customerId, is_deleted: false },
                relations: ['chat'],
                order: { joined_at: 'DESC' },
            });
            const chatList = yield Promise.all(participants.map((p) => __awaiter(this, void 0, void 0, function* () {
                const chat = p.chat;
                if (!chat)
                    return null;
                // Get last message
                const lastMessage = yield this.messageRepo.findOne({
                    where: {
                        chat: { id: chat.id },
                    },
                    order: {
                        createdAt: 'DESC',
                    },
                });
                // Count unread messages
                const unreadCount = yield this.messageRepo.count({
                    where: {
                        chat: { id: chat.id },
                        createdAt: (0, typeorm_2.MoreThan)(p.last_read_at || new Date(0)),
                        sender: { customer_id: (0, typeorm_2.Not)(customerId) },
                    },
                });
                return {
                    chat_id: chat.id,
                    chat_type: chat.chat_type,
                    title: chat.title,
                    avatar_url: chat.avatar_url,
                    last_message_id: chat.last_message_id,
                    last_message: (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.content) || null,
                    last_message_at: (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.createdAt) || null,
                    unread_count: unreadCount,
                    joined_at: p.joined_at,
                    role: p.role,
                };
            })));
            return chatList.filter(Boolean);
        });
    }
    saveMessage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = this.messageRepo.create({
                chat_id: data.chatId,
                content: data.content,
                voice_url: data.voiceUrl,
                senderCustomerId: data.senderCustomerId,
            });
            return yield this.messageRepo.save(message);
        });
    }
    updateLastReadAt(chatId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.chatParticipantRepo.update({ chat_id: chatId, user_id: userId }, { last_read_at: new Date() });
        });
    }
    getRecipientDeviceToken(chatId, senderId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const participant = yield this.chatParticipantRepo.findOne({
                where: {
                    chat_id: chatId,
                    user_id: (0, typeorm_2.Not)(senderId),
                },
                relations: ['user'],
            });
            return ((_a = participant === null || participant === void 0 ? void 0 : participant.user) === null || _a === void 0 ? void 0 : _a.notificationToken) || null;
        });
    }
    createOrJoinChat(userA, userB) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Check if a chat already exists (both directions)
            const existing = yield this.chatListRepo.findOne({
                where: [
                    { user1_id: userA, user2_id: userB },
                    { user1_id: userB, user2_id: userA },
                ],
            });
            // 2. If chat exists, return its ID
            if (existing) {
                return { chatId: existing.id };
            }
            // 3. Create new chat record
            const chat = yield this.chatListRepo.save({
                user1_id: userA,
                user2_id: userB,
            });
            // 4. Add both users to the chat_participants
            yield this.chatParticipantRepo.save([
                { chat_id: chat.id, user_id: userA },
                { chat_id: chat.id, user_id: userB },
            ]);
            // 5. Return new chat ID
            return { chatId: chat.id };
        });
    }
    getRecipientId(chatId, senderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const participants = yield this.chatParticipantRepo.find({
                where: { chat_id: chatId },
            });
            const recipient = participants.find(p => p.user_id !== senderId);
            return (recipient === null || recipient === void 0 ? void 0 : recipient.user_id) || null;
        });
    }
    searchMessages(chatId, keyword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.messageRepo.find({
                where: {
                    chat_id: chatId,
                    content: (0, typeorm_2.ILike)(`%${keyword}%`),
                },
                order: { createdAt: 'DESC' },
            });
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_participant_entity_1.ChatParticipantEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.MessageEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(chat_list_entity_1.ChatListEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ChatService);
