import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {MoreThan, Not, Repository} from 'typeorm';
import {ChatParticipantEntity} from "./entities/chat_participant.entity";
import {MessageEntity} from "./entities/message.entity";

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatParticipantEntity)
        private readonly chatParticipantRepo: Repository<ChatParticipantEntity>,
        @InjectRepository(MessageEntity)
        private readonly messageRepo: Repository<MessageEntity>
    ) {
    }

    async getChatListForUser(customerId: string): Promise<any[]> {
        const participants = await this.chatParticipantRepo.find({
            where: {user_id: customerId, is_deleted: false},
            relations: ['chat'],
            order: {joined_at: 'DESC'},
        });

        const chatList = await Promise.all(
            participants.map(async (p) => {
                const chat = p.chat;
                if (!chat) return null;

                // Get last message
                const lastMessage = await this.messageRepo.findOne({
                    where: {
                        chat: {id: chat.id},
                    },
                    order: {
                        createdAt: 'DESC',
                    },
                });

                // Count unread messages
                const unreadCount = await this.messageRepo.count({
                    where: {
                        chat: {id: chat.id},
                        createdAt: MoreThan(p.last_read_at || new Date(0)),
                        sender: {customer_id: Not(customerId)},
                    },
                });

                return {
                    chat_id: chat.id,
                    chat_type: chat.chat_type,
                    title: chat.title,
                    avatar_url: chat.avatar_url,
                    last_message_id: chat.last_message_id,
                    last_message: lastMessage?.content || null,
                    last_message_at: lastMessage?.createdAt || null,
                    unread_count: unreadCount,
                    joined_at: p.joined_at,
                    role: p.role,
                };
            }),
        );

        return chatList.filter(Boolean);
    }

    async saveMessage(data: {
        chatId: string;
        content: string;
        senderCustomerId: string;
    }): Promise<MessageEntity> {
        const message = this.messageRepo.create({
            chatId: data.chatId,
            content: data.content,
            senderCustomerId: data.senderCustomerId,
        });
        return await this.messageRepo.save(message);
    }

    async updateLastReadAt(chatId: string, userId: string): Promise<void> {
        await this.chatParticipantRepo.update(
            {chat_id: chatId, user_id: userId},
            {last_read_at: new Date()},
        );
    }

    async getRecipientDeviceToken(chatId: string, senderId: string): Promise<string | null> {
        const participant: ChatParticipantEntity | null = await this.chatParticipantRepo.findOne({
            where: {
                chat_id: chatId,
                user_id: Not(senderId),
            },
            relations: ['user'],
        });

        return participant?.user?.notificationToken || null;
    }

}
