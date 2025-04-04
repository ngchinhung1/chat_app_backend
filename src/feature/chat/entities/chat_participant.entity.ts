import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn} from 'typeorm';
import {ChatListEntity} from './chat_list.entity';
import {User} from "../../auth/entities/user.entity";

@Entity('chat_participant')
export class ChatParticipantEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    chat_id?: string;

    @Column()
    user_id?: string;

    @Column({type: 'enum', enum: ['admin', 'member'], default: 'member'})
    role?: 'admin' | 'member';

    @Column({default: false})
    is_muted?: boolean;

    @Column({default: false})
    is_archived?: boolean;

    @Column({default: false})
    is_deleted?: boolean;

    @Column({type: 'timestamp', nullable: true})
    last_read_at!: Date;

    @CreateDateColumn()
    joined_at!: Date;

    @ManyToOne(() => ChatListEntity)
    chat?: ChatListEntity;

    @ManyToOne(() => User, (user) => user.chatParticipants)
    @JoinColumn({name: 'user_id', referencedColumnName: 'customer_id'})
    user?: User;

}