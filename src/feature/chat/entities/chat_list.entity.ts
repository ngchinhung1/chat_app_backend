import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index} from 'typeorm';
import {MessageEntity} from "./message.entity";
import {ChatParticipantEntity} from "./chat_participant.entity";

@Entity('chat_list')
export class ChatListEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({nullable: true})
    user1_id?: string;

    @Column({nullable: true})
    user2_id?: string;

    @Column({type: 'enum', enum: ['private', 'group'], default: 'private'})
    chat_type?: 'private' | 'group';

    @Column({nullable: true})
    title?: string;

    @Column({nullable: true})
    avatar_url?: string;

    @Column({nullable: true})
    created_by?: string;

    @Column({ type: 'timestamp', nullable: true })
    created_at?: Date;

    @Column({ type: 'timestamp', nullable: true })
    updated_at?: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastMessageAt?: Date;

    @Column({nullable: true})
    last_message_id?: string;

    @Column({ nullable: true })
    last_message?: string;

    @Column({default: true})
    is_active?: boolean;

    @Column({type: 'json', nullable: true})
    extra_metadata?: Record<string, any>;

    @OneToMany(() => ChatParticipantEntity, (participant) => participant.chat, { cascade: true, eager: true })
    participants!: ChatParticipantEntity[];

    @OneToMany(() => MessageEntity, (message) => message.chat, { cascade: true })
    messages!: MessageEntity[];

}