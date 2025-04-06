import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';
import {MessageEntity} from "./message.entity";

@Entity('chat_list')
export class ChatListEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    user1_id?: string;

    @Column()
    user2_id?: string;

    @Column({type: 'enum', enum: ['private', 'group'], default: 'private'})
    chat_type?: 'private' | 'group';

    @Column({nullable: true})
    title?: string;

    @Column({nullable: true})
    avatar_url?: string;

    @Column()
    created_by?: string;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @Column({nullable: true})
    last_message_id?: string;

    @Column({default: true})
    is_active?: boolean;

    @Column({type: 'json', nullable: true})
    extra_metadata?: Record<string, any>;

    @OneToMany(() => MessageEntity, (message) => message.chat)
    messages?: MessageEntity[];
}