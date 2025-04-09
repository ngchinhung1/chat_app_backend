import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index} from 'typeorm';
import {MessageEntity} from "./message.entity";
import {ChatParticipantEntity} from "./chat_participant.entity";

@Entity('chat_list')
export class ChatListEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ nullable: true })
    user1_id?: string;

    @Column({ nullable: true })
    user2_id?: string;

    @Column({type: 'enum', enum: ['private', 'group'], default: 'private'})
    chat_type?: 'private' | 'group';

    @Column({nullable: true})
    title?: string;

    @Column({nullable: true})
    avatar_url?: string;

    @Column({ nullable: true })
    created_by?: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @Index()
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastMessageAt!: Date;

    @Column({nullable: true})
    last_message_id?: string;

    @Column({default: true})
    is_active?: boolean;

    @Column({type: 'json', nullable: true})
    extra_metadata?: Record<string, any>;

    @OneToMany(() => MessageEntity, (message) => message.chat)
    messages?: MessageEntity[];

    @OneToMany(() => ChatParticipantEntity, (cp) => cp.chat)
    participants?: ChatParticipantEntity[];

}