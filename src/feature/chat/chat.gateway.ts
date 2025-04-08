import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect, ConnectedSocket, MessageBody, OnGatewayInit
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {ChatService} from './chat.service';
import {SendMessageDto} from "./dto/send-message.dto";
import {FcmService} from "../../fcm/fcm.service";
import {UseGuards} from "@nestjs/common";
import {JwtWsAuthGuard} from "../../config/guards/jwtWsAuth.guard";

@WebSocketGateway({cors: true})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server | undefined;
    private connectedClients = new Map<string, Socket>();

    constructor(
        private readonly chatService: ChatService,
        private readonly fcmService: FcmService
    ) {
    }

    afterInit(server: Server) {
        console.log('✅ Chat Gateway initialized');

        server.on('connection', (socket: Socket) => {
            console.log(`🔌 New socket connected: ${socket.id}`);

            socket.onAny((event, data) => {
                console.log(`📡 [Socket Receive] Event: ${event}`);
                console.log('[Data]', data);
            });
        });
    }

    // 🔌 Track connections
    handleConnection(client: Socket) {
        const user = client.data.user;
        if (user?.customer_id) {
            this.connectedClients.set(user.customer_id, client);
        }
    }

    // 🔌 Track disconnections
    handleDisconnect(client: Socket) {
        const user = client.data.user;
        if (user?.customer_id) {
            this.connectedClients.delete(user.customer_id);
        }
    }

    // 🧠 Helper to get user's socket by their ID
    getSocketByUserId(userId: string | null): Socket | undefined {
        return this.connectedClients.get(<string>userId);
    }

    @SubscribeMessage('chat_list')
    async handleChatList(client: Socket) {
        const user = client.data.user;

        const chatList = await this.chatService.getChatListForUser(user.customer_id);

        client.emit('chat_list', chatList);
    }

    @SubscribeMessage('send_message')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: SendMessageDto,
    ) {

        const newMessage = await this.chatService.saveMessage({
            chatId: data.chat_id,
            content: data.text,
            voiceUrl: data.voiceUrl,
            fileType: data.file_type,
            senderCustomerId: data.customer_id,
        });

        // Emit the new message to all in the room
        this.server?.to(data.chat_id).emit('new_message', {
            chatId: data.chat_id,
            message: {
                id: newMessage.id,
                content: newMessage.content,
                voiceUrl: newMessage.voice_url || null,
                senderCustomerId: data.customer_id,
                createdAt: newMessage.createdAt,
            },
        });

        // ✅ Emit chat_list_update to sender (unreadCount = 0)
        client.emit('chat_list_update', {
            chatId: data.chat_id,
            lastMessage: newMessage.content,
            unreadCount: 0,
            updatedAt: new Date().toISOString(),
        });

        // ✅ Get recipient socket(s)
        const room = this.server!.sockets.adapter.rooms.get(data.chat_id);
        const isRecipientOnline: boolean = (room?.size ?? 0) > 1;

        // Get recipient ID and socket ID
        const recipientId = await this.chatService.getRecipientId(data.chat_id, data.customer_id);
        const recipientSocket = this.getSocketByUserId(recipientId);

        // ✅ Emit chat_list_update to recipient if online
        if (recipientSocket) {
            recipientSocket.emit('chat_list_update', {
                chatId: data.chat_id,
                lastMessage: newMessage.content,
                unreadCount: 1,
                updatedAt: new Date().toISOString(),
            });
        }

        // ✅ If recipient is offline, send FCM push
        try {
            if (!isRecipientOnline) {
                const recipientDeviceToken = await this.chatService.getRecipientDeviceToken(
                    data.chat_id,
                    data.customer_id,
                );

                if (recipientDeviceToken) {
                    await this.fcmService.send({
                        token: recipientDeviceToken,
                        notification: {
                            title: `New message`,
                            body: newMessage.content,
                        },
                        data: {
                            chatId: data.chat_id,
                            type: 'chat',
                        },
                    });
                }
            }
        } catch (error) {
            console.error('Error sending FCM push notification:', error);
        }

        return {
            id: newMessage.id,
            status: 'sent',
            timestamp: newMessage.createdAt,
        };
    }

    @SubscribeMessage('join_room')
    async handleJoinRoom(
        @MessageBody() data: { chatId: string; type: 'private' | 'group' },
        @ConnectedSocket() client: Socket,
    ) {
        const {chatId, type} = data;
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
    }

    @SubscribeMessage('leave_room')
    handleLeaveRoom(@MessageBody() chatId: string, @ConnectedSocket() client: Socket) {
        client.leave(chatId);
        console.log(`User ${client.data.user.customer_id} left room ${chatId}`);
    }

    @SubscribeMessage('user_typing')
    handleTyping(
        @MessageBody() data: { chatId: string; isTyping: boolean },
        @ConnectedSocket() client: Socket,
    ) {
        const sender = client.data.user;
        client.to(data.chatId).emit('typing', {
            senderCustomerId: sender.customer_id,
            isTyping: data.isTyping,
        });
    }

    @SubscribeMessage('message_read')
    async handleMessageRead(
        @MessageBody() payload: any,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        const {messageId, chatId, readerId, readAt} = payload;

        if (!messageId || !chatId || !readerId || !readAt) {
            console.warn('❌ Invalid message_read payload');
            return;
        }

        // ✅ Optional: update the message in DB
        await this.chatService.markMessageAsRead(messageId, new Date(readAt));

        // ✅ Broadcast to other users in the room
        client.to(chatId).emit('message_read', {
            messageId,
            chatId,
            readAt,
            readerId,
        });

        console.log(`📨 [message_read] → broadcasted in ${chatId}`);
    }


    @SubscribeMessage('read_message')
    async handleReadMessage(
        @MessageBody() data: { chatId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data.user;

        // ✅ Step 1: Update last_read_at
        await this.chatService.updateLastReadAt(data.chatId, user.customer_id);

        // ✅ Step 2: Notify other participants (optional)
        const recipientId = await this.chatService.getRecipientId(data.chatId, user.customer_id);
        const recipientSocket = this.getSocketByUserId(recipientId);

        if (recipientSocket) {
            recipientSocket.emit('message_read', {
                chatId: data.chatId,
                userId: user.customer_id,
                readAt: new Date().toISOString(),
            });
        }
    }

    @SubscribeMessage('search_messages')
    async handleSearchMessages(
        @MessageBody() data: { chatId: string; keyword: string },
        @ConnectedSocket() client: Socket,
    ) {
        const messages = await this.chatService.searchMessages(data.chatId, data.keyword);

        client.emit('search_messages_result', {
            chatId: data.chatId,
            keyword: data.keyword,
            results: messages,
        });
    }

    @SubscribeMessage('get_messages')
    async handleGetMessages(
        @MessageBody() data: { chatId: string },
        @ConnectedSocket() client: Socket
    ) {
        const messages = await this.chatService.getMessagesByChatId(data.chatId);
        client.emit('messages_response', messages);
    }

}