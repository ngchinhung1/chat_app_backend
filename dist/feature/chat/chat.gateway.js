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
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const send_message_dto_1 = require("./dto/send-message.dto");
const fcm_service_1 = require("../../fcm/fcm.service");
const common_1 = require("@nestjs/common");
const socketAuthMiddleware_1 = require("../../middleware/socketAuthMiddleware");
const jwtWsAuth_guard_1 = require("../../config/guards/jwtWsAuth.guard");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    configure(consumer) {
        consumer
            .apply(socketAuthMiddleware_1.socketAuthMiddleware)
            .forRoutes(ChatGateway_1);
    }
    constructor(chatService, fcmService) {
        this.chatService = chatService;
        this.fcmService = fcmService;
        this.connectedClients = new Map();
    }
    afterInit(server) {
        console.log('✅ Chat Gateway initialized');
        server.on('connection', (socket) => {
            console.log(`🔌 New socket connected: ${socket.id}`);
            socket.onAny((event, data) => {
                console.log(`📡 [Socket Receive] Event: ${event}`);
                console.log('[Data]', data);
            });
        });
    }
    // 🔌 Track connections
    handleConnection(client) {
        var _a;
        console.log('✅ Client connected:', client.id, (_a = client.user) === null || _a === void 0 ? void 0 : _a.customer_id);
        const user = client.data.user;
        if (user === null || user === void 0 ? void 0 : user.customer_id) {
            this.connectedClients.set(user.customer_id, client);
        }
    }
    // 🔌 Track disconnections
    handleDisconnect(client) {
        const user = client.data.user;
        if (user === null || user === void 0 ? void 0 : user.customer_id) {
            this.connectedClients.delete(user.customer_id);
        }
    }
    // 🧠 Helper to get user's socket by their ID
    getSocketByUserId(userId) {
        return this.connectedClients.get(userId);
    }
    handleChatListing(client, data) {
        console.log('📨 received chat_listing:', data);
        const chatList = [
            {
                chatId: '1',
                title: 'Support Chat',
                last_message: 'Hello there',
                last_message_at: new Date().toISOString(),
            },
            {
                chatId: '2',
                title: 'General Group',
                last_message: 'How are you?',
                last_message_at: new Date().toISOString(),
            },
        ];
        console.log('📤 sending chat_list:', chatList);
        client.emit('chat_list', chatList);
    }
    handleSendMessage(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const senderCustomerId = (_a = client.user.customer_id) !== null && _a !== void 0 ? _a : null;
            // ✅ Use your existing service method
            const message = yield this.chatService.sendMessage(senderCustomerId, data);
            // 🔥 Emit to the room so the receiver gets the new message
            this.server.to(data.chat_id).emit('new_message', message);
            // ✅ Use your own method to get the chat list item to refresh receiver UI
            const receiverId = yield this.chatService.getOtherParticipant(data.chat_id, senderCustomerId);
            const updatedChatListItem = yield this.chatService.getChatListItem(receiverId, data.chat_id);
            // 🎯 Emit real-time update to receiver’s chat list
            this.server.to(`user_${receiverId}`).emit('chat_list_update', updatedChatListItem);
            // ✅ Return message to sender (ack)
            return message;
        });
    }
    handleJoinRoom(client, data) {
        var _a;
        console.log(`🟢 User ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.customer_id} joining room ${data.chatId}`);
        client.join(data.chatId);
    }
    handleLeaveRoom(chatId, client) {
        client.leave(chatId);
        console.log(`User ${client.data.user.customer_id} left room ${chatId}`);
    }
    handleTyping(data, client) {
        const sender = client.data.user;
        client.to(data.chatId).emit('typing', {
            senderCustomerId: sender.customer_id,
            isTyping: data.isTyping,
        });
    }
    handleMessageRead(payload, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const { messageId, chatId, readerId, readAt } = payload;
            if (!messageId || !chatId || !readerId || !readAt) {
                console.warn('❌ Invalid message_read payload');
                return;
            }
            // ✅ Optional: update the message in DB
            yield this.chatService.markMessageAsRead(messageId, new Date(readAt));
            // ✅ Broadcast to other users in the room
            client.to(chatId).emit('message_read', {
                messageId,
                chatId,
                readAt,
                readerId,
            });
            console.log(`📨 [message_read] → broadcasted in ${chatId}`);
        });
    }
    handleReadMessage(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = client.data.user;
            // ✅ Step 1: Update last_read_at
            yield this.chatService.updateLastReadAt(data.chatId, user.customer_id);
            // ✅ Step 2: Notify other participants (optional)
            const recipientId = yield this.chatService.getRecipientId(data.chatId, user.customer_id);
            const recipientSocket = this.getSocketByUserId(recipientId);
            if (recipientSocket) {
                recipientSocket.emit('message_read', {
                    chatId: data.chatId,
                    userId: user.customer_id,
                    readAt: new Date().toISOString(),
                });
            }
        });
    }
    handleSearchMessages(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = yield this.chatService.searchMessages(data.chatId, data.keyword);
            client.emit('search_messages_result', {
                chatId: data.chatId,
                keyword: data.keyword,
                results: messages,
            });
        });
    }
    handleGetMessages(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = yield this.chatService.getMessages(data.chatId);
            client.emit('messages_response', messages);
        });
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat_listing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleChatListing", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('user_typing'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message_read'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessageRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('read_message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleReadMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('search_messages'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSearchMessages", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_messages'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetMessages", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, common_1.UseGuards)(jwtWsAuth_guard_1.JwtWsAuthGuard),
    (0, websockets_1.WebSocketGateway)({ cors: true }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        fcm_service_1.FcmService])
], ChatGateway);
