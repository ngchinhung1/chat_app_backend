import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect, ConnectedSocket, MessageBody, OnGatewayInit, WsException
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {ChatService} from './chat.service';
import {SendMessageDto} from "./dto/send-message.dto";
import {FcmService} from "../../fcm/fcm.service";
import {MiddlewareConsumer, NestModule, UseGuards} from "@nestjs/common";
import {AuthenticatedSocket} from "../../middleware/authenticated-socket.interface";
import {socketAuthMiddleware} from "../../middleware/socketAuthMiddleware";
import {JwtWsAuthGuard} from "../../config/guards/jwtWsAuth.guard";

@UseGuards(JwtWsAuthGuard)
@WebSocketGateway({cors: true})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(socketAuthMiddleware)
            .forRoutes(ChatGateway);
    }

    @WebSocketServer() server!: Server;
    private connectedClients = new Map<string, Socket>();

    constructor(
        private chatService: ChatService,
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
        console.log('✅ Client connected:', client.id, client.user?.customer_id);
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

    @SubscribeMessage('chat_listing')
    handleChatListing(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
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

    @SubscribeMessage('send_message')
    async handleSendMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: SendMessageDto
    ) {
        const senderCustomerId = client.user.customer_id ?? null;

        // ✅ Use your existing service method
        const message = await this.chatService.sendMessage(senderCustomerId, data);

        // 🔥 Emit to the room so the receiver gets the new message
        this.server.to(data.chat_id).emit('new_message', message);

        // ✅ Use your own method to get the chat list item to refresh receiver UI
        const receiverId = await this.chatService.getOtherParticipant(data.chat_id, senderCustomerId);
        const updatedChatListItem = await this.chatService.getChatListItem(receiverId, data.chat_id);

        // 🎯 Emit real-time update to receiver’s chat list
        this.server.to(`user_${receiverId}`).emit('chat_list_update', updatedChatListItem);

        // ✅ Return message to sender (ack)
        return message;
    }

    @SubscribeMessage('join_room')
    handleJoinRoom(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { chatId: string, type: string }
    ) {
        console.log(`🟢 User ${client.user?.customer_id} joining room ${data.chatId}`);
        client.join(data.chatId);
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
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { chatId: string }
    ) {
        const messages = await this.chatService.getMessages(data.chatId);

        client.emit('messages_response', messages);
    }

}