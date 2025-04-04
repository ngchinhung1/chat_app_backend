import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import {ChatListEntity} from './chat_list.entity';
import {User} from "../../auth/entities/user.entity";

@Entity('message')
export class MessageEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // Foreign key for chat
    @Column()
    chatId?: string;

    // Relation to ChatListEntity
    @ManyToOne(() => ChatListEntity, (chat) => chat.messages, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({name: 'chat_id'})
    chat?: ChatListEntity;

    // Foreign key for sender (customer_id)
    @Column()
    senderCustomerId?: string;

    // Relation to User entity
    @ManyToOne(() => User, (user) => user.messages, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({name: 'sender_customer_id', referencedColumnName: 'customer_id'})
    sender?: User;

    // Message text content
    @Column()
    content?: string;

    // Timestamp of message creation
    @CreateDateColumn()
    createdAt!: Date;
}