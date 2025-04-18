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
const message_entity_1 = require("./entities/message.entity");
const chat_list_entity_1 = require("./entities/chat_list.entity");
const user_entity_1 = require("../auth/entities/user.entity");
const conversation_entity_1 = require("./entities/conversation.entity");
const conversation_participants_entity_1 = require("./entities/conversation_participants.entity");
let ChatService = class ChatService {
    constructor(messageRepo, chatListRepo, userRepo, conversationRepository, conversationParticipantRepository) {
        this.messageRepo = messageRepo;
        this.chatListRepo = chatListRepo;
        this.userRepo = userRepo;
        this.conversationRepository = conversationRepository;
        this.conversationParticipantRepository = conversationParticipantRepository;
    }
    findSenderId(senderCustomerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepo.findOne({
                where: {
                    customer_id: senderCustomerId,
                },
            });
        });
    }
    findUserByPhone(toCountryCode, toPhoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepo.findOne({
                where: {
                    country_code: toCountryCode,
                    phone_number: toPhoneNumber,
                },
            });
        });
    }
    createConversation(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingConversation = yield this.conversationRepository.findOne({
                where: [
                    {
                        senderUserId: data.senderUserId,
                        receiverUserId: data.receiverUserId,
                    },
                    {
                        senderUserId: data.receiverUserId,
                        receiverUserId: data.senderUserId,
                    },
                ],
            });
            if (existingConversation) {
                return existingConversation;
            }
            // Create the conversation entity with the provided sender/receiver info.
            const conversation = this.conversationRepository.create({
                senderCustomerId: data.senderCustomerId,
                senderUserId: data.senderUserId,
                receiverCustomerId: data.receiverCustomerId,
                receiverUserId: data.receiverUserId,
            });
            const savedConversation = yield this.conversationRepository.save(conversation);
            // Create conversation participant for the sender.
            const senderParticipant = this.conversationParticipantRepository.create({
                conversation: savedConversation,
                userId: data.senderUserId,
                customerID: data.senderCustomerId,
            });
            // Create conversation participant for the receiver.
            const receiverParticipant = this.conversationParticipantRepository.create({
                conversation: savedConversation,
                userId: data.receiverUserId,
                customerID: data.receiverCustomerId,
            });
            // Save both conversation participants in one go.
            yield this.conversationParticipantRepository.save([senderParticipant, receiverParticipant]);
            return savedConversation;
        });
    }
    sendMessage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { conversationId, content, fileType, senderCustomerId } = data;
            // Fetch the conversation to ensure it exists.
            const conversation = yield this.conversationRepository.findOne({ where: { conversationId: conversationId } });
            if (!conversation) {
                throw new common_1.NotFoundException('Conversation not found');
            }
            // Determine the receiver’s customerId.
            let receiverCustomerId;
            if (senderCustomerId === conversation.senderCustomerId) {
                receiverCustomerId = conversation.receiverCustomerId;
            }
            else {
                receiverCustomerId = conversation.senderCustomerId;
            }
            // Create a new message entity.
            const message = this.messageRepo.create({
                conversationId,
                sendBy: senderCustomerId,
                content,
                senderCustomerId,
                receiverCustomerId,
                status: message_entity_1.MessageStatus.SENT,
                fileType: fileType || 'text',
                fileUrl: fileType !== 'text' ? content : '',
                createdAt: new Date(),
            });
            // Save and return the message.
            return yield this.messageRepo.save(message);
        });
    }
    getMessages(conversationId_1, cursor_1) {
        return __awaiter(this, arguments, void 0, function* (conversationId, cursor, limit = 20) {
            const query = this.messageRepo.createQueryBuilder('message')
                .where('message.conversationId = :conversationId', { conversationId });
            if (cursor) {
                // We assume that cursor is a timestamp string.
                query.andWhere('message.createdAt < :cursor', { cursor });
            }
            query.orderBy('message.createdAt', 'DESC') // fetch latest messages first
                .limit(limit);
            const messages = yield query.getMany();
            // Reverse the result so that messages are in chronological order (oldest first)
            return messages.reverse();
        });
    }
    updateChatListForUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            let chatList = yield this.chatListRepo.findOne({
                where: { conversationId: data.conversationId, customerId: data.customerId },
            });
            if (!chatList) {
                chatList = this.chatListRepo.create({
                    conversationId: data.conversationId,
                    customerId: data.customerId,
                    chat_type: data.chatType,
                    receiverFirstName: (_a = data.contact) === null || _a === void 0 ? void 0 : _a.firstName,
                    receiverLastName: (_b = data.contact) === null || _b === void 0 ? void 0 : _b.lastName,
                    receiverCountryCode: (_c = data.contact) === null || _c === void 0 ? void 0 : _c.countryCode,
                    receiverPhoneNumber: (_d = data.contact) === null || _d === void 0 ? void 0 : _d.phoneNumber,
                    lastMessage: data.lastMessage,
                    groupName: data.groupName,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    unreadCount: data.isNewMessage ? 1 : 0,
                });
            }
            else {
                chatList.receiverFirstName = (_e = data.contact) === null || _e === void 0 ? void 0 : _e.firstName;
                chatList.receiverLastName = (_f = data.contact) === null || _f === void 0 ? void 0 : _f.lastName;
                chatList.receiverCountryCode = (_g = data.contact) === null || _g === void 0 ? void 0 : _g.countryCode;
                chatList.receiverPhoneNumber = (_h = data.contact) === null || _h === void 0 ? void 0 : _h.phoneNumber;
                chatList.unreadCount = data.isNewMessage
                    ? chatList.unreadCount + 1
                    : 0;
                chatList.lastMessage = data.lastMessage;
                chatList.updatedAt = new Date();
                // If this update is due to a new unread message from the other party, increment unreadCount.
                // Otherwise (i.e. for the sender), you might want to reset unreadCount to 0.
            }
            return yield this.chatListRepo.save(chatList);
        });
    }
    getChatLists(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatLists = yield this.chatListRepo.find({
                where: { customerId },
                order: { updatedAt: 'DESC' },
            });
            return chatLists.map((entry) => {
                const dto = {
                    id: entry.id,
                    conversationId: entry.conversationId,
                    customerId: entry.customerId,
                    chatType: entry.chat_type,
                    lastMessage: entry.lastMessage,
                    updatedAt: entry.updatedAt,
                    unreadCount: entry.unreadCount,
                };
                if (entry.chat_type === 'group') {
                    // For group chats, use groupName as the title.
                    dto.title = entry.groupName || '';
                }
                else {
                    // For private chats, send raw contact fields for the frontend to compute the title.
                    dto.firstName = entry.receiverFirstName;
                    dto.lastName = entry.receiverLastName;
                    dto.countryCode = entry.receiverCountryCode;
                    dto.phoneNumber = entry.receiverPhoneNumber;
                }
                return dto;
            });
        });
    }
    markChatListAsRead(conversationId, customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            let chatList = yield this.chatListRepo.findOne({
                where: { conversationId, customerId },
            });
            if (!chatList) {
                throw new Error('Chat list entry not found');
            }
            chatList.unreadCount = 0;
            chatList.updatedAt = new Date();
            return yield this.chatListRepo.save(chatList);
        });
    }
    toChatListDto(entity) {
        return {
            id: entity.id,
            conversationId: entity.conversationId,
            customerId: entity.customerId,
            chatType: entity.chat_type,
            firstName: entity.receiverFirstName,
            lastName: entity.receiverLastName,
            countryCode: entity.receiverCountryCode,
            phoneNumber: entity.receiverPhoneNumber,
            title: entity.groupName,
            lastMessage: entity.lastMessage,
            updatedAt: entity.updatedAt,
            unreadCount: entity.unreadCount,
        };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.MessageEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(chat_list_entity_1.ChatListEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(conversation_entity_1.ConversationEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(conversation_participants_entity_1.ConversationParticipantsEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ChatService);
