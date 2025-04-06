import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {ILike, MoreThan, Not, Repository} from 'typeorm';
import {ChatParticipantEntity} from "./entities/chat_participant.entity";
import {MessageEntity} from "./entities/message.entity";
import {User} from "../auth/entities/user.entity";
import {ChatListEntity} from "./entities/chat_list.entity";

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatParticipantEntity)
        private readonly chatParticipantRepo: Repository<ChatParticipantEntity>,
        @InjectRepository(MessageEntity)
        private readonly messageRepo: Repository<MessageEntity>,
        @InjectRepository(ChatListEntity)
        private readonly chatListRepo: Repository<ChatListEntity>,
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
        voiceUrl?: string;
        senderCustomerId: string;
    }): Promise<MessageEntity> {
        const message = this.messageRepo.create({
            chat_id: data.chatId,
            content: data.content,
            voice_url: data.voiceUrl,
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

    async createOrJoinChat(userA: string, userB: string): Promise<{ chatId: string }> {
        // 1. Check if a chat already exists (both directions)
        const existing = await this.chatListRepo.findOne({
            where: [
                {user1_id: userA, user2_id: userB},
                {user1_id: userB, user2_id: userA},
            ],
        });

        // 2. If chat exists, return its ID
        if (existing) {
            return {chatId: existing.id};
        }

        // 3. Create new chat record
        const chat = await this.chatListRepo.save({
            user1_id: userA,
            user2_id: userB,
        });

        // 4. Add both users to the chat_participants
        await this.chatParticipantRepo.save([
            {chat_id: chat.id, user_id: userA},
            {chat_id: chat.id, user_id: userB},
        ]);

        // 5. Return new chat ID
        return {chatId: chat.id};
    }

    async getRecipientId(chatId: string, senderId: string): Promise<string | null> {
        const participants = await this.chatParticipantRepo.find({
            where: {chat_id: chatId},
        });

        const recipient = participants.find(p => p.user_id !== senderId);
        return recipient?.user_id || null;
    }

    async searchMessages(chatId: string, keyword: string): Promise<MessageEntity[]> {
        return await this.messageRepo.find({
            where: {
                chat_id: chatId,
                content: ILike(`%${keyword}%`),
            },
            order: {createdAt: 'DESC'},
        });
    }

}
