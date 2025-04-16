import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn, OneToMany,
} from 'typeorm';
import {ConversationParticipantsEntity} from "./conversation_participants.entity";

export enum ConversationType {
    PRIVATE = 'private',
    GROUP = 'group',
}

@Entity('conversations')
export class ConversationEntity {
    @PrimaryGeneratedColumn('uuid')
    conversationId!: string;

    @Column({type: 'enum', enum: ConversationType, default: ConversationType.PRIVATE})
    conversationType!: ConversationType;

    @Column({nullable: false})
    senderCustomerId!: string;

    @Column({nullable: false})
    senderUserId!: string;

    @Column({nullable: false})
    receiverCustomerId?: string;

    @Column({nullable: false})
    receiverUserId!: string;

    @OneToMany(
        () => ConversationParticipantsEntity,
        (participant) => participant.conversation,
        {cascade: true},
    )
    participants!: ConversationParticipantsEntity[];

    @CreateDateColumn({type: 'timestamp'})
    createdAt!: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt!: Date;
}