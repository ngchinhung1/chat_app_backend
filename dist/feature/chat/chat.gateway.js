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
const fcm_service_1 = require("../../fcm/fcm.service");
let ChatGateway = class ChatGateway {
    constructor(chatService, fcmService) {
        this.chatService = chatService;
        this.fcmService = fcmService;
        this.connectedClients = new Map();
    }
    // 🔌 Track connections
    handleConnection(client) {
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
    // handleConnection(client: Socket) {
    //     const user = client.data.user;
    //     console.log('Socket connected:', user?.phone_number || user?.customer_id);
    // }
    //
    // handleDisconnect(client: Socket) {
    //     const user = client.data.user;
    //     console.log('Socket disconnected:', user?.phone_number || user?.customer_id);
    // }
    handleChatList(client) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = client.data.user;
            const chatList = yield this.chatService.getChatListForUser(user.customer_id);
            client.emit('chat_list', chatList);
        });
    }
    handleSendMessage(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const sender = client.data.user;
            const newMessage = yield this.chatService.saveMessage({
                chatId: data.chatId,
                content: data.content,
                senderCustomerId: sender.customer_id,
            });
            // Emit the new message to all in the room
            (_a = this.server) === null || _a === void 0 ? void 0 : _a.to(data.chatId).emit('new_message', {
                chatId: data.chatId,
                message: {
                    id: newMessage.id,
                    content: newMessage.content,
                    voiceUrl: newMessage.voice_url || null,
                    senderCustomerId: sender.customer_id,
                    createdAt: newMessage.createdAt,
                },
            });
            // ✅ Emit chat_list_update to sender (unreadCount = 0)
            client.emit('chat_list_update', {
                chatId: data.chatId,
                lastMessage: newMessage.content,
                unreadCount: 0,
                updatedAt: new Date().toISOString(),
            });
            // ✅ Get recipient socket(s)
            const room = this.server.sockets.adapter.rooms.get(data.chatId);
            const isRecipientOnline = ((_b = room === null || room === void 0 ? void 0 : room.size) !== null && _b !== void 0 ? _b : 0) > 1;
            // Get recipient ID and socket ID
            const recipientId = yield this.chatService.getRecipientId(data.chatId, sender.customer_id);
            const recipientSocket = this.getSocketByUserId(recipientId);
            // ✅ Emit chat_list_update to recipient if online
            if (recipientSocket) {
                recipientSocket.emit('chat_list_update', {
                    chatId: data.chatId,
                    lastMessage: newMessage.content,
                    unreadCount: 1,
                    updatedAt: new Date().toISOString(),
                });
            }
            // ✅ If recipient is offline, send FCM push
            if (!isRecipientOnline) {
                const recipientDeviceToken = yield this.chatService.getRecipientDeviceToken(data.chatId, sender.customer_id);
                if (recipientDeviceToken) {
                    yield this.fcmService.send({
                        token: recipientDeviceToken,
                        notification: {
                            title: `New message`,
                            body: newMessage.content,
                        },
                        data: {
                            chatId: data.chatId,
                            type: 'chat',
                        },
                    });
                }
            }
        });
    }
    handleJoinRoom(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chatId, type } = data;
            const user = client.data.user;
            if (!chatId || !type) {
                return client.emit('error', {
                    message: 'chatId and type are required.',
                });
            }
            // Get rooms joined by the client
            const rooms = [...client.rooms];
            // Check if already joined
            if (rooms.includes(chatId)) {
                return client.emit('already_joined', {
                    chatId,
                    type,
                    message: `Already joined ${type} chat room.`,
                });
            }
            // Join the chat room
            client.join(chatId);
            // Broadcast or confirm
            client.emit('joined_room', {
                chatId,
                type,
                message: `Successfully joined ${type} chat room.`,
            });
            // Optional: Notify other participants if it's a group
            if (type === 'group') {
                client.to(chatId).emit('user_joined', {
                    chatId,
                    userId: user.customer_id,
                });
            }
        });
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
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", Object)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat_list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleChatList", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_message_dto_1.SendMessageDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
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
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        fcm_service_1.FcmService])
], ChatGateway);
