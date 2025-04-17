import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect, ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {ChatService} from './chat.service';
import {SendMessageDto} from "./dto/send-message.dto";
import {AuthenticatedSocket} from "../../middleware/authenticated-socket.interface";
import {GetMessagesDto} from "./dto/get-message.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {Contact} from "../contact/entities/contact.entity";
import {Repository} from "typeorm";

@WebSocketGateway({cors: true})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server!: Server;
    private connectedClients = new Map<string, Socket>();

    constructor(private chatService: ChatService,
                @InjectRepository(Contact)
                private readonly contactRepo: Repository<Contact>) {
    }

    afterInit(server: Server) {

        server.on('connection', (socket: Socket) => {
            console.log(`🔌 New socket connected: ${socket.id}`);

            socket.onAny((event, ...args) => {
                console.log(`📡 [Raw Socket] Received event: ${event}`, args);
            });
        });
    }

    handleConnection(client: AuthenticatedSocket) {
        console.log('✅ handleConnection for:', client.id, client.data.user?.customer_id);
        const user = client.data.user;
        if (user?.customer_id) {
            this.connectedClients.set(user.customer_id, client);
        }
    }

    handleDisconnect(client: AuthenticatedSocket) {
        const user = client.data.user;
        if (user?.customer_id) {
            this.connectedClients.delete(user.customer_id);
        }
    }

    @SubscribeMessage('authenticate')
    async handleAuth(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { customerId: string }
    ) {
        client.join(`user_${payload.customerId}`);
    }

    @SubscribeMessage('create_conversation')
    async handleCreateConversation(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { toCountryCode: string; toPhoneNumber: string; conversationType?: string },
    ) {
        try {
            const senderCustomerId = client.data.user?.customer_id ?? null;
            const {toCountryCode, toPhoneNumber, conversationType} = data;

            const senderId = await this.chatService.findSenderId(senderCustomerId);
            if (!senderId) {
                return {
                    status: false,
                    code: 400,
                    msg: 'Recipient not found.',
                };
            }

            const recipient = await this.chatService.findUserByPhone(toCountryCode, toPhoneNumber);
            if (!recipient) {
                return {
                    status: false,
                    code: 400,
                    msg: 'Recipient not found.',
                };
            }

            // Create a new conversation.
            const conversation = await this.chatService.createConversation({
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
        } catch (error: any) {
            return {
                status: false,
                code: 400,
                msg: error.message,
            };
        }
    }

    @SubscribeMessage('join_room')
    handleJoinRoom(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { conversationId: string },
    ) {
        client.join(data.conversationId);
        return {status: true, msg: `Joined room ${data.conversationId}`};
    }

    @SubscribeMessage('send_message')
    async handleSendMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: SendMessageDto,
        ack?: Function,
    ) {
        try {
            const senderCustomerId = client.data.user?.customer_id ?? null;

            const message = await this.chatService.sendMessage({
                ...data,
                senderCustomerId,
            });

            const receiverContact = await this.contactRepo.findOne({
                where: {customer_id: message.receiverCustomerId},
            });

            const senderContact = await this.contactRepo.findOne({
                where: {customer_id: senderCustomerId},
            });
            console.log(`🔌 customer_id: ${senderCustomerId}`);

            // Update the chat list for the sender.
            const updatedForSender = await this.chatService.updateChatListForUser({
                conversationId: message.conversationId,
                customerId: message.senderCustomerId,
                chatType: 'private',  // explicitly state the chat type for a private conversation
                // For the sender’s list, we include contact info about the receiver.
                contact: {
                    customerId: message.receiverCustomerId,
                    firstName: receiverContact?.first_name,
                    lastName: receiverContact?.last_name,
                    countryCode: receiverContact?.country_code,
                    phoneNumber: receiverContact?.phone_number,
                },
                lastMessage: message.content || '',
                isNewMessage: false,
            });
            console.log(`🔌 updateChatListForUser sender: ${receiverContact?.phone_number}`);

            // Update the chat list for the receiver.
            const updatedForReceiver = await this.chatService.updateChatListForUser({
                conversationId: message.conversationId,
                customerId: message.receiverCustomerId,
                chatType: 'private',  // for a private chat, this stays "private"
                // For the receiver’s list, include contact info about the sender.
                contact: {
                    customerId: senderCustomerId,
                    firstName: senderContact?.first_name,
                    lastName: senderContact?.last_name,
                    countryCode: senderContact?.country_code,
                    phoneNumber: senderContact?.phone_number,
                },
                lastMessage: message.content || '',
                isNewMessage: true,
            });
            console.log(`🔌 updateChatListForUser receiver: ${senderContact?.phone_number}`);

            // Broadcast the new message to all clients in the conversation room.
            // (Assuming your conversationId is the same as data.chatId.)
            client.broadcast.to(data.conversationId).emit('new_message', message);

            // now map each entity into the DTO shape…
            const senderDto = this.chatService.toChatListDto(updatedForSender);
            const receiverDto = this.chatService.toChatListDto(updatedForReceiver);

            // …and broadcast them
            this.server
                .to(`user_${message.senderCustomerId}`)
                .emit('chat_list_update', senderDto);

            this.server
                .to(`user_${message.receiverCustomerId}`)
                .emit('chat_list_update', receiverDto);

            // Acknowledge the sender with success.
            if (ack) ack({status: true, code: 200, message});
            return {status: true, code: 200, message};
        } catch (error: any) {
            // Send error acknowledgment.
            if (ack) ack({status: false, code: 400, msg: error.message});
            return {status: false, code: 400, msg: error.message};
        }
    }

    @SubscribeMessage('get_messages')
    async handleGetMessages(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: GetMessagesDto,
        ack?: Function,
    ) {
        try {
            // Call the service to get the messages.
            const messages = await this.chatService.getMessages(
                data.conversationId,
                data.cursor,
                data.limit || 20,
            );

            // Optionally broadcast or simply acknowledge the client.
            // Here we use the ack callback to send back the response.
            if (ack) {
                ack({status: true, code: 200, messages});
            }
            return {status: true, code: 200, messages};
        } catch (error: any) {
            if (ack) {
                ack({status: false, code: 400, msg: error.message});
            }
            return {status: false, code: 400, msg: error.message};
        }
    }

    @SubscribeMessage('get_chat_list')
    async handleGetChatList(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { customerId?: string },
        ack?: Function,
    ) {
        try {
            // Prefer extracting customerId from the authenticated socket
            const customerId = data.customerId || client.data.user?.customerId;
            if (!customerId) {
                throw new Error('Customer ID not provided');
            }
            const chatLists = await this.chatService.getChatLists(customerId);

            if (ack) {
                ack({status: true, code: 200, chatLists});
            }
            return {status: true, code: 200, chatLists};
        } catch (error: any) {
            if (ack) {
                ack({status: false, code: 400, msg: error.message});
            }
            return {status: false, code: 400, msg: error.message};
        }
    }

    @SubscribeMessage('mark_as_read')
    async handleMarkAsRead(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { conversationId: string },
        ack?: Function,
    ) {
        try {
            // Assume the customer ID is taken from client data
            const customerId = client.data.user?.customer_id;
            if (!customerId) {
                throw new Error('Customer ID not found');
            }
            const updatedChatList = await this.chatService.markChatListAsRead(data.conversationId, customerId);
            if (ack) {
                ack({status: true, code: 200, chatList: updatedChatList});
            }
            return {status: true, code: 200, chatList: updatedChatList};
        } catch (error: any) {
            if (ack) {
                ack({status: false, code: 400, msg: error.message});
            }
            return {status: false, code: 400, msg: error.message};
        }
    }

}