import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';
import {ChatList} from "./chat_list.entity";
import {User} from "../../auth/entities/user.entity";

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn()
    id!: string;

    // Chat the message belongs to
    @ManyToOne(() => ChatList, (chat) => chat.messages, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'chat_id'})
    chat!: ChatList;

    // User who sent the message
    @ManyToOne(() => User)
    @JoinColumn({ name: 'sender_customer_id', referencedColumnName: 'customer_id' })
    sender!: User;

    // Actual message text content
    @Column({type: 'text', nullable: true})
    content?: string;

    // If it's a media message
    @Column({nullable: true})
    mediaUrl?: string;

    @Column({nullable: true})
    mediaType?: 'image' | 'video' | 'audio' | 'file';

    // Reply to another message (threading)
    @ManyToOne(() => Message, {nullable: true})
    @JoinColumn({name: 'reply_to'})
    replyTo?: Message;

    // Reaction (emoji support)
    @Column({type: 'json', nullable: true})
    reactions?: {
        [emoji: string]: string[]; // example: { "❤️": ["user1", "user2"] }
    };

    // Whether the message has been edited
    @Column({default: false})
    isEdited!: boolean;

    // Soft-delete flag
    @Column({default: false})
    isDeleted!: boolean;

    // Seen/read status (for optimization — optional)
    @Column({type: 'json', nullable: true})
    seenBy?: string[]; // Array of userIds who have seen this message

    @CreateDateColumn({name: 'created_at'})
    createdAt!: Date;

    @UpdateDateColumn({name: 'updated_at'})
    updatedAt?: Date;
}