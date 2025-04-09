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

@WebSocketGateway({cors: true})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
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
    async handleChatList(@MessageBody() data: { customer_id: string }, @ConnectedSocket() client: Socket) {
        const chatList = await this.chatService.getChatListForUser(data.customer_id);
        client.emit('chat_list', chatList);
    }

    @SubscribeMessage('send_message')
    async handleSendMessage(@MessageBody() data: {
        chat_id: string,
        sender_id: string,
        content: string,
        file_type?: string,
        status?: string,
        customer_id?: string,
        attachment_url?: string,
        voice_url?: string,
    }) {
        const message = await this.chatService.saveMessage(data);
        this.server.to(data.chat_id).emit('new_message', message);
        return message; // Acknowledgement back to sender
    }

    @SubscribeMessage('join_room')
    handleJoinRoom(@MessageBody() data: { chatId: string }, @ConnectedSocket() client: Socket) {
        client.join(data.chatId);
        client.emit('joined_room', {chatId: data.chatId});
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
    async handleGetMessages(@MessageBody() data: { chatId: string }, @ConnectedSocket() client: Socket) {
        const messages = await this.chatService.getMessages(data.chatId);
        client.emit('get_messages', messages);
    }

}