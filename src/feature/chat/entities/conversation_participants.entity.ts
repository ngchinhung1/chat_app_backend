import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';
import {UserEntity} from "../../auth/entities/user.entity";
import {ConversationEntity} from "./conversation.entity";


export enum ConversationParticipantRole {
    ADMIN = 'admin',
    MEMBER = 'member',
}

@Entity('conversation_participants')
export class ConversationParticipantsEntity {
    @PrimaryGeneratedColumn('uuid')
    participantId!: string;

    // Many participants can belong to one conversation.
    @ManyToOne(
        () => ConversationEntity,
        (conversation) => conversation.participants,
        {onDelete: 'CASCADE'},
    )
    @JoinColumn({name: 'conversation_id'})
    conversation!: ConversationEntity;

    @Column({name: 'conversation_id'})
    conversationId!: string;

    @ManyToOne(() => UserEntity, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'user_id'})
    user!: UserEntity;

    @Column({name: 'user_id'})
    userId!: string;

    @Column({name: 'customer_id'})
    customerID!: string;

    @Column({
        type: 'enum',
        enum: ConversationParticipantRole,
        default: ConversationParticipantRole.MEMBER,
    })
    role!: ConversationParticipantRole;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt!: Date;

    @CreateDateColumn({type: 'timestamp'})
    createdAt!: Date;
}