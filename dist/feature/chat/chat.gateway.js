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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const send_message_dto_1 = require("./dto/send-message.dto");
const get_message_dto_1 = require("./dto/get-message.dto");
const typeorm_1 = require("@nestjs/typeorm");
const contact_entity_1 = require("../contact/entities/contact.entity");
const typeorm_2 = require("typeorm");
let ChatGateway = class ChatGateway {
    constructor(chatService, contactRepo) {
        this.chatService = chatService;
        this.contactRepo = contactRepo;
        this.connectedClients = new Map();
    }
    afterInit(server) {
        server.on('connection', (socket) => {
            console.log(`🔌 New socket connected: ${socket.id}`);
            socket.onAny((event, ...args) => {
                console.log(`📡 [Raw Socket] Received event: ${event}`, args);
            });
        });
    }
    handleConnection(client) {
        var _a;
        console.log('✅ handleConnection for:', client.id, (_a = client.data.user) === null || _a === void 0 ? void 0 : _a.customer_id);
        const user = client.data.user;
        if (user === null || user === void 0 ? void 0 : user.customer_id) {
            this.connectedClients.set(user.customer_id, client);
        }
    }
    handleDisconnect(client) {
        const user = client.data.user;
        if (user === null || user === void 0 ? void 0 : user.customer_id) {
            this.connectedClients.delete(user.customer_id);
        }
    }
    handleCreateConversation(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const senderCustomerId = (_b = (_a = client.data.user) === null || _a === void 0 ? void 0 : _a.customer_id) !== null && _b !== void 0 ? _b : null;
                const { toCountryCode, toPhoneNumber, conversationType } = data;
                const senderId = yield this.chatService.findSenderId(senderCustomerId);
                if (!senderId) {
                    return {
                        status: false,
                        code: 400,
                        msg: 'Recipient not found.',
                    };
                }
                const recipient = yield this.chatService.findUserByPhone(toCountryCode, toPhoneNumber);
                if (!recipient) {
                    return {
                        status: false,
                        code: 400,
                        msg: 'Recipient not found.',
                    };
                }
                // Create a new conversation.
                const conversation = yield this.chatService.createConversation({
                    senderCustomerId,
                    senderUserId: senderId.id,
                    receiverCustomerId: recipient.customer_id,
                    receiverUserId: recipient.id,
                    conversationType: conversationType || 'private',
                });
                // Return the result as an acknowledgment back to the client.
                return {
                    status: true,
                    code: 200,
                    conversation,
                };
            }
            catch (error) {
                return {
                    status: false,
                    code: 400,
                    msg: error,
                };
            }
        });
    }
    handleJoinRoom(client, data) {
        client.join(data.conversationId);
        return { status: true, msg: `Joined room ${data.conversationId}` };
    }
    handleSendMessage(client, data, ack) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const senderCustomerId = (_b = (_a = client.data.user) === null || _a === void 0 ? void 0 : _a.customer_id) !== null && _b !== void 0 ? _b : null;
                const message = yield this.chatService.sendMessage(Object.assign(Object.assign({}, data), { senderCustomerId }));
                const receiverContact = yield this.contactRepo.findOne({
                    where: { customer_id: message.receiverCustomerId },
                });
                const senderContact = yield this.contactRepo.findOne({
                    where: { customer_id: senderCustomerId },
                });
                // Update the chat list for the sender.
                yield this.chatService.updateChatListForUser({
                    conversationId: message.conversationId,
                    customerId: message.senderCustomerId,
                    chatType: 'private', // explicitly state the chat type for a private conversation
                    // For the sender’s list, we include contact info about the receiver.
                    contact: {
                        customerId: message.receiverCustomerId,
                        firstName: receiverContact === null || receiverContact === void 0 ? void 0 : receiverContact.first_name,
                        lastName: receiverContact === null || receiverContact === void 0 ? void 0 : receiverContact.last_name,
                        countryCode: receiverContact === null || receiverContact === void 0 ? void 0 : receiverContact.country_code,
                        phoneNumber: receiverContact === null || receiverContact === void 0 ? void 0 : receiverContact.phone_number,
                    },
                    lastMessage: message.content || '',
                    isNewMessage: false,
                });
                // Update the chat list for the receiver.
                yield this.chatService.updateChatListForUser({
                    conversationId: message.conversationId,
                    customerId: message.receiverCustomerId,
                    chatType: 'private', // for a private chat, this stays "private"
                    // For the receiver’s list, include contact info about the sender.
                    contact: {
                        customerId: message.senderCustomerId,
                        firstName: senderContact === null || senderContact === void 0 ? void 0 : senderContact.first_name,
                        lastName: senderContact === null || senderContact === void 0 ? void 0 : senderContact.last_name,
                        countryCode: senderContact === null || senderContact === void 0 ? void 0 : senderContact.country_code,
                        phoneNumber: senderContact === null || senderContact === void 0 ? void 0 : senderContact.phone_number,
                    },
                    lastMessage: message.content || '',
                    isNewMessage: true,
                });
                // Broadcast the new message to all clients in the conversation room.
                // (Assuming your conversationId is the same as data.chatId.)
                this.server.to(data.conversationId).emit('new_message', message);
                // Acknowledge the sender with success.
                if (ack)
                    ack({ status: true, code: 200, message });
                return { status: true, code: 200, message };
            }
            catch (error) {
                // Send error acknowledgment.
                if (ack)
                    ack({ status: false, code: 400, msg: error });
                return { status: false, code: 400, msg: error };
            }
        });
    }
    handleGetMessages(client, data, ack) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Call the service to get the messages.
                const messages = yield this.chatService.getMessages(data.conversationId, data.cursor, data.limit || 20);
                // Optionally broadcast or simply acknowledge the client.
                // Here we use the ack callback to send back the response.
                if (ack) {
                    ack({ status: true, code: 200, messages });
                }
                return { status: true, code: 200, messages };
            }
            catch (error) {
                if (ack) {
                    ack({ status: false, code: 400, msg: error });
                }
                return { status: false, code: 400, msg: error };
            }
        });
    }
    handleGetChatList(client, data, ack) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Prefer extracting customerId from the authenticated socket
                const customerId = data.customerId || ((_a = client.data.user) === null || _a === void 0 ? void 0 : _a.customerId);
                if (!customerId) {
                    throw new Error('Customer ID not provided');
                }
                const chatLists = yield this.chatService.getChatLists(customerId);
                if (ack) {
                    ack({ status: true, code: 200, chatLists });
                }
                return { status: true, code: 200, chatLists };
            }
            catch (error) {
                if (ack) {
                    ack({ status: false, code: 400, msg: error });
                }
                return { status: false, code: 400, msg: error };
            }
        });
    }
    handleMarkAsRead(client, data, ack) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Assume the customer ID is taken from client data
                const customerId = (_a = client.data.user) === null || _a === void 0 ? void 0 : _a.customer_id;
                if (!customerId) {
                    throw new Error('Customer ID not found');
                }
                const updatedChatList = yield this.chatService.markChatListAsRead(data.conversationId, customerId);
                if (ack) {
                    ack({ status: true, code: 200, chatList: updatedChatList });
                }
                return { status: true, code: 200, chatList: updatedChatList };
            }
            catch (error) {
                if (ack) {
                    ack({ status: false, code: 400, msg: error });
                }
                return { status: false, code: 400, msg: error };
            }
        });
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('create_conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleCreateConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, send_message_dto_1.SendMessageDto,
        Function]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_messages'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_message_dto_1.GetMessagesDto,
        Function]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetMessages", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_chat_list'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetChatList", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_as_read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkAsRead", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true }),
    __param(1, (0, typeorm_1.InjectRepository)(contact_entity_1.Contact)),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        typeorm_2.Repository])
], ChatGateway);
