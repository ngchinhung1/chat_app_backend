import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {ILike, MoreThan, Not, Repository} from 'typeorm';
import {ChatParticipantEntity} from "./entities/chat_participant.entity";
import {MessageEntity} from "./entities/message.entity";
import {ChatListEntity} from "./entities/chat_list.entity";
import {UserEntity} from "../auth/entities/user.entity";
import {SendMessageDto} from "./dto/send-message.dto";

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
        console.log('[getChatListForUser] fetching chat list for:', customerId);
        const participants = await this.chatParticipantRepo.find({
            where: {customer_id: customerId, is_deleted: false},
            relations: ['chat'],
            order: {joined_at: 'DESC'},
        });

        console.log('[getChatListForUser] found participants:', participants.length);
        // If this returns [], no chat will be shown
        if (!participants.length) return [];

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

    async sendMessage(sendBy: string, sendMessageDto: SendMessageDto) {
        const {chat_id, content} = sendMessageDto;

        // Check if chat already exists between these participants
        let chat = await this.chatListRepo.createQueryBuilder('chat')
            .leftJoin('chat.participants', 'participant')
            .where('participant.userId IN (:...userIds)', {userIds: [sendBy, chat_id]})
            .groupBy('chat.id')
            .having('COUNT(DISTINCT participant.userId) = 2') // ensures exactly two participants
            .getOne();

        if (!chat) {
            chat = this.chatListRepo.create({
                participants: [
                    this.chatParticipantRepo.create({user_id: sendBy.toString()}),
                    this.chatParticipantRepo.create({user_id: chat_id.toString()}),
                ],
                last_message: content,
                lastMessageAt: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
            });
            await this.chatListRepo.save(chat);
        } else {
            chat.last_message = content;
            chat.lastMessageAt = new Date();
            chat.updated_at = new Date();
            await this.chatListRepo.save(chat);
        }

        // Save the message with the chat id
        const message = this.messageRepo.create({
            chat_id: chat.id.toString(),
            send_by: sendBy.toString(),
            content: content,
            createdAt: new Date(),
        });

        await this.messageRepo.save(message);

        return {
            ...message,
            status: 'sent',
            read_at: new Date(),
        };
    }

    async getOtherParticipant(chatId: string, sendBy: string): Promise<string> {
        const chat = await this.chatListRepo.findOne({
            where: {id: chatId},
            relations: ['participants'],
        });

        if (!chat) throw new Error('Chat not found');

        const receiver = chat.participants.find(p => p.user_id !== sendBy);
        if (!receiver) throw new Error('Receiver not found');

        return receiver.user_id;
    }

    async getChatListItem(userId: string, chatId: string) {
        const chat = await this.chatListRepo.findOne({
            where: {id: chatId},
            relations: ['participants'],
        });

        if (!chat) throw new Error('Chat not found');

        return {
            chatId: chat.id,
            name: chat.title ?? '',
            lastMessage: chat.last_message ?? '',
            updatedAt: chat.lastMessageAt?.toISOString() ?? '',
        };
    }

    async markMessageAsRead(messageId: string, readAt: Date): Promise<void> {
        await this.messageRepo.update(
            {id: messageId},
            {read_at: readAt}
        );
    }

    async updateLastReadAt(chatId: string, userId: string): Promise<void> {
        await this.chatParticipantRepo.update(
            {chat_id: chatId, user_id: userId},
            {last_read_at: new Date()},
        );
    }

    async getRecipientDeviceToken(chatId: string, sendBy: string): Promise<string | null> {
        const participant: ChatParticipantEntity | null = await this.chatParticipantRepo.findOne({
            where: {
                chat_id: chatId,
                user_id: Not(sendBy),
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

    async getRecipientId(chatId: string, sendBy: string): Promise<string | null> {
        const participants = await this.chatParticipantRepo.find({
            where: {chat_id: chatId},
        });

        const recipient = participants.find(p => p.user_id !== sendBy);
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

    async getMessages(chatId: string) {
        return this.messageRepo.find({
            where: {chat_id: chatId},
            order: {createdAt: 'ASC'},
        });
    }

}
