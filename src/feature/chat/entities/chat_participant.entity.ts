import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    CreateDateColumn,
    UpdateDateColumn, JoinColumn,
} from 'typeorm';
import {User} from "../../auth/entities/user.entity";
import {ChatList} from "./chat_list.entity";

@Entity('chat_participants')
export class ChatParticipant {
    @PrimaryGeneratedColumn()
    id!: string;

    @ManyToOne(() => ChatList, (chat) => chat.participants)
    chat?: ChatList;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'customer_id', referencedColumnName: 'customer_id' })
    user!: User;

    @Column({default: false})
    isAdmin!: boolean;

    @Column({default: false})
    isMuted!: boolean;

    @Column({type: 'timestamp', nullable: true})
    lastSeenAt?: Date;

    @CreateDateColumn()
    joinedAt!: Date;

    @UpdateDateColumn()
    updatedAt?: Date;
}
