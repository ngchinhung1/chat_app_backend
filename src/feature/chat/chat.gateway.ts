import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect, ConnectedSocket, MessageBody
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {ChatService} from './chat.service';
import {SendMessageDto} from "./dto/send-message.dto";
import {FcmService} from "../../fcm/fcm.service";

@WebSocketGateway({cors: true})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server | undefined;
    private connectedClients = new Map<string, Socket>();

    constructor(
        private readonly chatService: ChatService,
        private readonly fcmService: FcmService
    ) {
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

    // handleConnection(client: Socket) {
    //     const user = client.data.user;
    //     console.log('Socket connected:', user?.phone_number || user?.customer_id);
    // }
    //
    // handleDisconnect(client: Socket) {
    //     const user = client.data.user;
    //     console.log('Socket disconnected:', user?.phone_number || user?.customer_id);
    // }

    @SubscribeMessage('chat_list')
    async handleChatList(client: Socket) {
        const user = client.data.user;

        const chatList = await this.chatService.getChatListForUser(user.customer_id);

        client.emit('chat_list', chatList);
    }

    @SubscribeMessage('send_message')
    async handleSendMessage(
        @MessageBody() data: SendMessageDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        const sender = client.data.user;

        const newMessage = await this.chatService.saveMessage({
            chatId: data.chatId,
            content: data.content,
            senderCustomerId: sender.customer_id,
        });

        // Emit the new message to all in the room
        this.server?.to(data.chatId).emit('new_message', {
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
        const room = this.server!.sockets.adapter.rooms.get(data.chatId);
        const isRecipientOnline: boolean = (room?.size ?? 0) > 1;

        // Get recipient ID and socket ID
        const recipientId = await this.chatService.getRecipientId(data.chatId, sender.customer_id);
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
            const recipientDeviceToken = await this.chatService.getRecipientDeviceToken(
                data.chatId,
                sender.customer_id,
            );

            if (recipientDeviceToken) {
                await this.fcmService.send({
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

}