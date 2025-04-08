import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {ILike, MoreThan, Not, Repository} from 'typeorm';
import {ChatParticipantEntity} from "./entities/chat_participant.entity";
import {MessageEntity} from "./entities/message.entity";
import {ChatListEntity} from "./entities/chat_list.entity";
import {UserEntity} from "../auth/entities/user.entity";

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatParticipantEntity)
        private readonly chatParticipantRepo: Repository<ChatParticipantEntity>,
        @InjectRepository(MessageEntity)
        private readonly messageRepo: Repository<MessageEntity>,
        @InjectRepository(ChatListEntity)
        private readonly chatListRepo: Repository<ChatListEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
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

    async openPrivateChatRoom(userA: UserEntity, userB: UserEntity): Promise<ChatListEntity> {
        return await this.findOrCreatePrivateChat(userA.customer_id, userB.customer_id);
    }

    async findOrCreatePrivateChat(userACustomerId: string, userBCustomerId: string): Promise<ChatListEntity> {
        const [userA, userB] = [userACustomerId, userBCustomerId].sort();

        const existingChat = await this.chatListRepo
            .createQueryBuilder('chat')
            .innerJoin('chat.participants', 'participantA', 'participantA.customer_id = :userA', {userA})
            .innerJoin('chat.participants', 'participantB', 'participantB.customer_id = :userB', {userB})
            .where('chat.chat_type = :type', {type: 'private'})
            .getOne();

        if (existingChat) return existingChat;

        const savedChat = await this.chatListRepo.save(
            this.chatListRepo.create({
                chat_type: 'private',
                user1_id: userA,
                user2_id: userB,
                created_by: userA,
            }),
        );

        // 🧠 Must load full users to assign `user: UserEntity`
        const userAEntity = await this.userRepo.findOne({where: {customer_id: userA}});
        const userBEntity = await this.userRepo.findOne({where: {customer_id: userB}});

        if (!userAEntity || !userBEntity) {
            throw new Error('One or both users not found');
        }

        const participants = this.chatParticipantRepo.create([
            {
                chat: savedChat,
                user: userAEntity, // ✅ now TypeORM can set `user_id`
                customer_id: userAEntity.customer_id,
            },
            {
                chat: savedChat,
                user: userBEntity,
                customer_id: userBEntity.customer_id,
            },
        ]);

        await this.chatParticipantRepo.save(participants);

        return savedChat;
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

    async getMessagesByChatId(chatId: string): Promise<MessageEntity[]> {
        return this.messageRepo.find({
            where: {chat: {id: chatId}},
            order: {createdAt: 'ASC'},
        });
    }

}
