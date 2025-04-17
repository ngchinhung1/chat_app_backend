import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {MessageEntity, MessageStatus} from "./entities/message.entity";
import {ChatListEntity} from "./entities/chat_list.entity";
import {UserEntity} from "../auth/entities/user.entity";
import {SendMessageDto} from "./dto/send-message.dto";
import {ConversationEntity} from "./entities/conversation.entity";
import {ConversationParticipantsEntity} from "./entities/conversation_participants.entity";
import {ChatListDto} from "./dto/chat_list.dto";

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(MessageEntity)
        private readonly messageRepo: Repository<MessageEntity>,
        @InjectRepository(ChatListEntity)
        private readonly chatListRepo: Repository<ChatListEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(ConversationEntity)
        private readonly conversationRepository: Repository<ConversationEntity>,
        @InjectRepository(ConversationParticipantsEntity)
        private readonly conversationParticipantRepository: Repository<ConversationParticipantsEntity>,
    ) {
    }

    async findSenderId(
        senderCustomerId: string
    ): Promise<UserEntity | null> {
        return await this.userRepo.findOne({
            where: {
                customer_id: senderCustomerId,
            },
        });
    }

    async findUserByPhone(
        toCountryCode: string,
        toPhoneNumber: string,
    ): Promise<UserEntity | null> {
        return await this.userRepo.findOne({
            where: {
                country_code: toCountryCode,
                phone_number: toPhoneNumber,
            },
        });
    }

    async createConversation(data: {
        senderCustomerId: string;
        senderUserId: string;
        receiverCustomerId: string;
        receiverUserId: string;
        conversationType?: string;
    }): Promise<ConversationEntity> {
        const existingConversation = await this.conversationRepository.findOne({
            where: [
                {
                    senderUserId: data.senderUserId,
                    receiverUserId: data.receiverUserId,
                },
                {
                    senderUserId: data.receiverUserId,
                    receiverUserId: data.senderUserId,
                },
            ],
        });

        if (existingConversation) {
            return existingConversation;
        }
        // Create the conversation entity with the provided sender/receiver info.
        const conversation = this.conversationRepository.create({
            senderCustomerId: data.senderCustomerId,
            senderUserId: data.senderUserId,
            receiverCustomerId: data.receiverCustomerId,
            receiverUserId: data.receiverUserId,
        });
        const savedConversation = await this.conversationRepository.save(conversation);

        // Create conversation participant for the sender.
        const senderParticipant = this.conversationParticipantRepository.create({
            conversation: savedConversation,
            userId: data.senderUserId,
            customerID: data.senderCustomerId,
        });

        // Create conversation participant for the receiver.
        const receiverParticipant = this.conversationParticipantRepository.create({
            conversation: savedConversation,
            userId: data.receiverUserId,
            customerID: data.receiverCustomerId,
        });

        // Save both conversation participants in one go.
        await this.conversationParticipantRepository.save([senderParticipant, receiverParticipant]);

        return savedConversation;
    }

    async sendMessage(data: SendMessageDto & { senderCustomerId: string }): Promise<MessageEntity> {
        const {conversationId, content, file_type, senderCustomerId, fileUrl} = data;

        // Fetch the conversation to ensure it exists.
        const conversation = await this.conversationRepository.findOne({where: {conversationId: conversationId}});
        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        // Determine the receiver’s customerId.
        let receiverCustomerId: string | undefined;
        if (senderCustomerId === conversation.senderCustomerId) {
            receiverCustomerId = conversation.receiverCustomerId;
        } else {
            receiverCustomerId = conversation.senderCustomerId;
        }

        // Create a new message entity.
        const message = this.messageRepo.create({
            conversationId,
            sendBy: senderCustomerId,
            content,
            senderCustomerId,
            receiverCustomerId,
            status: MessageStatus.SENT,
            fileType: file_type || 'text',
            fileUrl: fileUrl || '',
            createdAt: new Date(),
        });

        // Save and return the message.
        const savedMessage = await this.messageRepo.save(message);
        return savedMessage;
    }

    async getMessages(conversationId: string, cursor?: string, limit = 20): Promise<MessageEntity[]> {
        const query = this.messageRepo.createQueryBuilder('message')
            .where('message.conversationId = :conversationId', {conversationId});

        if (cursor) {
            // We assume that cursor is a timestamp string.
            query.andWhere('message.createdAt < :cursor', {cursor});
        }

        query.orderBy('message.createdAt', 'DESC') // fetch latest messages first
            .limit(limit);

        const messages = await query.getMany();

        // Reverse the result so that messages are in chronological order (oldest first)
        return messages.reverse();
    }

    async updateChatListForUser(data: {
        conversationId: string;
        customerId: string;
        chatType: string;
        contact?: {
            customerId?: string,
            firstName?: string,
            lastName?: string,
            countryCode?: string,
            phoneNumber?: string
        };
        lastMessage: string;
        groupName?: string;
        isNewMessage?: boolean;
    }): Promise<ChatListEntity> {
        let chatList = await this.chatListRepo.findOne({
            where: {conversationId: data.conversationId, customerId: data.customerId},
        });

        if (!chatList) {
            chatList = this.chatListRepo.create({
                conversationId: data.conversationId,
                customerId: data.customerId,
                chat_type: data.chatType as 'private' | 'group',
                receiverFirstName: data.contact?.firstName,
                receiverLastName: data.contact?.lastName,
                receiverCountryCode: data.contact?.countryCode,
                receiverPhoneNumber: data.contact?.phoneNumber,
                lastMessage: data.lastMessage,
                groupName: data.groupName,
                createdAt: new Date(),
                updatedAt: new Date(),
                unreadCount: data.isNewMessage ? 1 : 0,
            });
        } else {
            chatList.receiverFirstName = data.contact?.firstName;
            chatList.receiverLastName = data.contact?.lastName;
            chatList.receiverCountryCode = data.contact?.countryCode;
            chatList.receiverPhoneNumber = data.contact?.phoneNumber;
            chatList.unreadCount = data.isNewMessage
                ? chatList.unreadCount + 1
                : 0;

            chatList.lastMessage = data.lastMessage;
            chatList.updatedAt = new Date();
            // If this update is due to a new unread message from the other party, increment unreadCount.
            // Otherwise (i.e. for the sender), you might want to reset unreadCount to 0.
            if (data.isNewMessage) {
                chatList.unreadCount = chatList.unreadCount + 0;
            } else {
                chatList.unreadCount = 0;
            }
        }
        return await this.chatListRepo.save(chatList);
    }

    async getChatLists(customerId: string): Promise<ChatListDto[]> {
        const chatLists = await this.chatListRepo.find({
            where: {customerId},
            order: {updatedAt: 'DESC'},
        });

        return chatLists.map((entry) => {
            const dto: ChatListDto = {
                id: entry.id,
                conversationId: entry.conversationId,
                customerId: entry.customerId,
                chatType: entry.chat_type,
                lastMessage: entry.lastMessage,
                updatedAt: entry.updatedAt,
                unreadCount: entry.unreadCount,
            };

            if (entry.chat_type === 'group') {
                // For group chats, use groupName as the title.
                dto.title = entry.groupName || '';
            } else {
                // For private chats, send raw contact fields for the frontend to compute the title.
                dto.firstName = entry.receiverFirstName;
                dto.lastName = entry.receiverLastName;
                dto.countryCode = entry.receiverCountryCode;
                dto.phoneNumber = entry.receiverPhoneNumber;
            }
            return dto;
        });
    }

    async markChatListAsRead(conversationId: string, customerId: string): Promise<ChatListEntity> {
        let chatList = await this.chatListRepo.findOne({
            where: {conversationId, customerId},
        });
        if (!chatList) {
            throw new Error('Chat list entry not found');
        }
        chatList.unreadCount = 0;
        chatList.updatedAt = new Date();
        return await this.chatListRepo.save(chatList);
    }

    toChatListDto(entity: ChatListEntity): ChatListDto {
        return {
            id: entity.id,
            conversationId: entity.conversationId,
            customerId: entity.customerId,
            chatType: entity.chat_type,
            firstName: entity.receiverFirstName,
            lastName: entity.receiverLastName,
            countryCode: entity.receiverCountryCode,
            phoneNumber: entity.receiverPhoneNumber,
            title: entity.groupName,
            lastMessage: entity.lastMessage,
            updatedAt: entity.updatedAt,
            unreadCount: entity.unreadCount,
        };
    }

}
