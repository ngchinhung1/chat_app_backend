import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import {UserEntity} from '../../auth/entities/user.entity';

@Entity('engagement_identifiers')
export class EngagementIdentifier {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column({nullable: true})
    notificationToken?: string;

    @Column({nullable: true})
    advertisementId?: string;

    @Column({nullable: true})
    deviceId?: string;

    @Column({nullable: true})
    devicePlatform?: string;

    @Column({nullable: true})
    deviceModel?: string;

    @Column({nullable: true})
    osVersion?: string;

    @Column({nullable: true})
    appVersion?: string;

    @Column({nullable: true})
    locale?: string;

    @Column({ default: false })
    isLogin?: boolean;

    @Column({ default: false })
    isRegistered?: boolean;

    @ManyToOne(() => UserEntity, {nullable: true, onDelete: 'SET NULL'})
    @JoinColumn({name: 'customer_id', referencedColumnName: 'customer_id'})
    user?: UserEntity;

    @Column({nullable: true})
    customer_id?: string;

    @Column({type: 'timestamp', nullable: true})
    lastActiveAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}