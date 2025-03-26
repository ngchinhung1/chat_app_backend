import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import {Message} from './message.entity';
import {ChatParticipant} from './chat_participant.entity';

@Entity('chat_list')
export class ChatList {
    @PrimaryGeneratedColumn('uuid')
    chatId!: string;

    @Column({default: 'individual'}) // or 'group'
    type!: 'individual' | 'group';

    @Column({nullable: true})
    groupName?: string;

    @Column({nullable: true})
    imageUrl?: string;

    @Column({nullable: true})
    description?: string; // description or group bio

    @Column({nullable: true})
    createdByCustomerId?: string; // user ID of creator

    @Column({default: false})
    isPrivate!: boolean; // if true, not searchable

    @Column({default: false})
    isArchived!: boolean; // for hiding inactive chats

    @Column({default: false})
    isMuted!: boolean; // muted group notifications

    @Column({default: false})
    isPinned!: boolean; // pin to top of chat list

    @Column({default: false})
    isSystemChat!: boolean; // system-level, e.g., support

    @Column({type: 'json', nullable: true})
    metadata?: Record<string, any>; // additional flags or configs (e.g. themeColor)

    @Column({type: 'timestamp', nullable: true})
    lastActivityAt?: Date; // last activity from anyone in the chat

    @UpdateDateColumn()
    lastMessageTime!: Date; // updated when message is sent

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => ChatParticipant, (cp) => cp.chat)
    participants!: ChatParticipant[];

    @OneToMany(() => Message, (m) => m.chat)
    messages?: Message[];
}