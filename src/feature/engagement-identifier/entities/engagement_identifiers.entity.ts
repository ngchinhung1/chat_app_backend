import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import {User} from '../../auth/entities/user.entity';

export enum DevicePlatform {
    IOS = 'ios',
    ANDROID = 'android',
    WEB = 'web',
    OTHERS = 'others',
}

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

    @Column({type: 'enum', enum: DevicePlatform, default: DevicePlatform.OTHERS})
    devicePlatform?: DevicePlatform;

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

    @ManyToOne(() => User, {nullable: true, onDelete: 'SET NULL'})
    @JoinColumn({name: 'customer_id', referencedColumnName: 'customer_id'})
    user?: User;

    @Column({nullable: true})
    customer_id?: string;

    @Column({type: 'timestamp', nullable: true})
    lastActiveAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}