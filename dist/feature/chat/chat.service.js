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
const user_entity_1 = require("../auth/entities/user.entity");
let ChatService = class ChatService {
    constructor(chatParticipantRepo, messageRepo, chatListRepo, userRepo) {
        this.chatParticipantRepo = chatParticipantRepo;
        this.messageRepo = messageRepo;
        this.chatListRepo = chatListRepo;
        this.userRepo = userRepo;
    }
    getChatListForUser(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[getChatListForUser] fetching chat list for:', customerId);
            const participants = yield this.chatParticipantRepo.find({
                where: { customer_id: customerId, is_deleted: false },
                relations: ['chat'],
                order: { joined_at: 'DESC' },
            });
            console.log('[getChatListForUser] found participants:', participants.length);
            // If this returns [], no chat will be shown
            if (!participants.length)
                return [];
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
    sendMessage(sendBy, sendMessageDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chat_id, content } = sendMessageDto;
            // Check if chat already exists between these participants
            let chat = yield this.chatListRepo.createQueryBuilder('chat')
                .leftJoin('chat.participants', 'participant')
                .where('participant.userId IN (:...userIds)', { userIds: [sendBy, chat_id] })
                .groupBy('chat.id')
                .having('COUNT(DISTINCT participant.userId) = 2') // ensures exactly two participants
                .getOne();
            if (!chat) {
                chat = this.chatListRepo.create({
                    participants: [
                        this.chatParticipantRepo.create({ user_id: sendBy.toString() }),
                        this.chatParticipantRepo.create({ user_id: chat_id.toString() }),
                    ],
                    last_message: content,
                    lastMessageAt: new Date(),
                    created_at: new Date(),
                    updated_at: new Date(),
                });
                yield this.chatListRepo.save(chat);
            }
            else {
                chat.last_message = content;
                chat.lastMessageAt = new Date();
                chat.updated_at = new Date();
                yield this.chatListRepo.save(chat);
            }
            // Save the message with the chat id
            const message = this.messageRepo.create({
                chat_id: chat.id.toString(),
                send_by: sendBy.toString(),
                content: content,
                createdAt: new Date(),
            });
            yield this.messageRepo.save(message);
            return Object.assign(Object.assign({}, message), { status: 'sent', read_at: new Date() });
        });
    }
    getOtherParticipant(chatId, sendBy) {
        return __awaiter(this, void 0, void 0, function* () {
            const chat = yield this.chatListRepo.findOne({
                where: { id: chatId },
                relations: ['participants'],
            });
            if (!chat)
                throw new Error('Chat not found');
            const receiver = chat.participants.find(p => p.user_id !== sendBy);
            if (!receiver)
                throw new Error('Receiver not found');
            return receiver.user_id;
        });
    }
    getChatListItem(userId, chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const chat = yield this.chatListRepo.findOne({
                where: { id: chatId },
                relations: ['participants'],
            });
            if (!chat)
                throw new Error('Chat not found');
            return {
                chatId: chat.id,
                name: (_a = chat.title) !== null && _a !== void 0 ? _a : '',
                lastMessage: (_b = chat.last_message) !== null && _b !== void 0 ? _b : '',
                updatedAt: (_d = (_c = chat.lastMessageAt) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : '',
            };
        });
    }
    markMessageAsRead(messageId, readAt) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.messageRepo.update({ id: messageId }, { read_at: readAt });
        });
    }
    updateLastReadAt(chatId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.chatParticipantRepo.update({ chat_id: chatId, user_id: userId }, { last_read_at: new Date() });
        });
    }
    getRecipientDeviceToken(chatId, sendBy) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const participant = yield this.chatParticipantRepo.findOne({
                where: {
                    chat_id: chatId,
                    user_id: (0, typeorm_2.Not)(sendBy),
                },
                relations: ['user'],
            });
            return ((_a = participant === null || participant === void 0 ? void 0 : participant.user) === null || _a === void 0 ? void 0 : _a.notificationToken) || null;
        });
    }
    openPrivateChatRoom(userA, userB) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findOrCreatePrivateChat(userA.customer_id, userB.customer_id);
        });
    }
    findOrCreatePrivateChat(userACustomerId, userBCustomerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [userA, userB] = [userACustomerId, userBCustomerId].sort();
            const existingChat = yield this.chatListRepo
                .createQueryBuilder('chat')
                .innerJoin('chat.participants', 'participantA', 'participantA.customer_id = :userA', { userA })
                .innerJoin('chat.participants', 'participantB', 'participantB.customer_id = :userB', { userB })
                .where('chat.chat_type = :type', { type: 'private' })
                .getOne();
            if (existingChat)
                return existingChat;
            const savedChat = yield this.chatListRepo.save(this.chatListRepo.create({
                chat_type: 'private',
                user1_id: userA,
                user2_id: userB,
                created_by: userA,
            }));
            // 🧠 Must load full users to assign `user: UserEntity`
            const userAEntity = yield this.userRepo.findOne({ where: { customer_id: userA } });
            const userBEntity = yield this.userRepo.findOne({ where: { customer_id: userB } });
            if (!userAEntity || !userBEntity) {
                throw new Error('One or both users not found');
            }
            const participants = this.chatParticipantRepo.create([
                {
                    chat: savedChat,
                    user: userAEntity, // ✅ now TypeORM can set `user_id`
                    customer_id: userAEntity.customer_id,
                },
                {
                    chat: savedChat,
                    user: userBEntity,
                    customer_id: userBEntity.customer_id,
                },
            ]);
            yield this.chatParticipantRepo.save(participants);
            return savedChat;
        });
    }
    getRecipientId(chatId, sendBy) {
        return __awaiter(this, void 0, void 0, function* () {
            const participants = yield this.chatParticipantRepo.find({
                where: { chat_id: chatId },
            });
            const recipient = participants.find(p => p.user_id !== sendBy);
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
    getMessages(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.messageRepo.find({
                where: { chat_id: chatId },
                order: { createdAt: 'ASC' },
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
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ChatService);
