import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {UseGuards} from '@nestjs/common';
import {JwtPayload} from '../auth/interfaces/jwt-payload.interface';
import {ChatService} from './chat.service';
import {WsJwtGuard} from "../../config/guards/jwtAuthGuard";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection {
    constructor(private readonly chatService: ChatService) {
    }

    @WebSocketServer()
    server?: Server;

    handleConnection(client: Socket & { user?: JwtPayload }) {
        console.log('User connected:', client.user?.userId);
    }

    @SubscribeMessage('chat_list')
    async handleChatList(
        @ConnectedSocket() client: Socket & { user?: JwtPayload },
        @MessageBody() _: any,
    ): Promise<void> {
        const userId = client.user?.customer_id;

        if (!userId) {
            client.emit('chat_list_response', {error: 'Invalid user ID'});
            return;
        }

        const chatList = await this.chatService.getChatListForUser(userId);
        client.emit('chat_list_response', chatList);
    }
}
