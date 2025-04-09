import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import {ChatListEntity} from './chat_list.entity';
import {UserEntity} from "../../auth/entities/user.entity";

@Entity('message')
export class MessageEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // Foreign key for chat
    @Column({name: 'chat_id'})
    chat_id!: string;

    @Column()
    sender_id!: string;

    // Relation to ChatListEntity
    @ManyToOne(() => ChatListEntity, {nullable: false})
    @JoinColumn({name: 'chat_id'})
    chat!: ChatListEntity;

    // Foreign key for sender (customer_id)
    @Column()
    senderCustomerId?: string;

    // Relation to User entity
    @ManyToOne(() => UserEntity, (user) => user.messages, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({name: 'sender_customer_id', referencedColumnName: 'customer_id'})
    sender?: UserEntity;

    // Message text content
    @Column({type: 'text'})
    content?: string;

    // Timestamp of message creation
    @CreateDateColumn({type: 'timestamp'})
    createdAt!: Date;

    @Column({nullable: true})
    file_type?: string;

    @Column({nullable: true})
    attachment_url?: string;

    @Column({nullable: true})
    voice_url?: string;

    @Column({type: 'timestamp', nullable: true})
    read_at?: Date | null;

}