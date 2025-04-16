import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('chat_lists')
export class ChatListEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({nullable: false})
    conversationId!: string;

    @Column({nullable: false})
    customerId!: string;

    // Chat type: "private" or "group"
    @Column({nullable: false, default: 'private'})
    chat_type!: string;

    // For private chats, store the contact's first name (optional)
    @Column({nullable: true})
    receiverFirstName?: string;

    // For private chats, store the contact's last name (optional)
    @Column({nullable: true})
    receiverLastName?: string;

    @Column({nullable: true})
    receiverCountryCode?: string;

    // For private chats, store the contact's phone number (optional)
    @Column({nullable: true})
    receiverPhoneNumber?: string;

    // For group chats, store the group name or title.
    @Column({nullable: true})
    groupName?: string;

    // Optionally, an avatar URL can be stored (useful for both private and group chats)
    @Column({nullable: true})
    avatar_url?: string;

    // A preview or summary of the last message.
    @Column({type: 'text', nullable: true})
    lastMessage?: string;

    // Unread message count.
    @Column({type: 'int', nullable: false, default: 0})
    unreadCount!: number;

    // You may also include a flag to mark active chat lists.
    @Column({default: true})
    is_active?: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}