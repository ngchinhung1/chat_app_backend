import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum MessageStatus {
    SENDING = 'sending',
    SENT = 'sent',
    DELIVERED = 'delivered',
    READ = 'read',
    FAILED = 'failed',
}

@Entity('message')
export class MessageEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({nullable: false})
    conversationId!: string;

    @Column({nullable: false})
    sendBy!: string;

    @Column({type: 'text', nullable: true})
    content?: string;

    @Column({nullable: false})
    senderCustomerId!: string;

    @Column({nullable: false})
    receiverCustomerId!: string;

    // Message status to track if it's sending, sent, delivered, read, etc.
    @Column({
        type: 'enum',
        enum: MessageStatus,
        default: MessageStatus.SENDING,
    })
    status!: MessageStatus;

    // Optional field for file type if message contains media. Default is 'text'.
    @Column({nullable: true, default: 'text'})
    fileType?: string;

    @Column({nullable: true})
    fileUrl?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

}