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

    constructor(
        private readonly chatService: ChatService,
        private readonly fcmService: FcmService
    ) {
    }

    handleConnection(client: Socket) {
        const user = client.data.user;
        console.log('Socket connected:', user?.phone_number || user?.customer_id);
    }

    handleDisconnect(client: Socket) {
        const user = client.data.user;
        console.log('Socket disconnected:', user?.phone_number || user?.customer_id);
    }

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

        // Emit to other users in the chat room
        this.server!.to(data.chatId).emit('new_message', {
            chatId: data.chatId,
            message: {
                id: newMessage.id,
                content: newMessage.content,
                senderCustomerId: sender.customer_id,
                createdAt: newMessage.createdAt,
            },
        });

        // Check if recipient is online (optional logic)
        const recipientDeviceToken = await this.chatService.getRecipientDeviceToken(data.chatId, sender.customer_id); // write this service logic

        const room = this.server!.sockets.adapter.rooms.get(data.chatId);
        const isRecipientOnline: boolean = (room?.size ?? 0) > 1;

        if (!isRecipientOnline && recipientDeviceToken) {
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

    @SubscribeMessage('join_room')
    handleJoinRoom(@MessageBody() chatId: string, @ConnectedSocket() client: Socket) {
        client.join(chatId);
        console.log(`User ${client.data.user.customer_id} joined room ${chatId}`);
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
        @MessageBody() chatId: string,
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data.user;

        // ✅ Update last read timestamp
        await this.chatService.updateLastReadAt(chatId, user.customer_id);

        // 🟡 Optional: notify other users
        this.server!.to(chatId).emit('message_read', {
            chatId,
            readerCustomerId: user.customer_id,
        });
    }

}