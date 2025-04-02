import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';
import {DevicePlatform, EngagementIdentifier} from "../../engagement-identifier/entities/engagement_identifiers.entity";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column({unique: true})
    phone_number!: string;

    @Column()
    country_code!: string;

    @Column({nullable: true})
    name?: string;

    @Column({nullable: true, type: 'text'})
    profile_image?: string;

    @OneToMany(() => EngagementIdentifier, (engagement) => engagement.user)
    engagementIdentifiers?: EngagementIdentifier[];

    @Column({nullable: true})
    notificationToken?: string;

    @Column({nullable: true})
    advertisementId?: string;

    @Column({nullable: true})
    @Column({type: 'enum', enum: DevicePlatform})
    devicePlatform?: DevicePlatform;

    @Column({name: 'is_verified', default: false})
    isVerified!: boolean;

    @Column({default: false})
    is_blocked!: boolean;

    @Column({default: false})
    is_deleted!: boolean;

    @Column({unique: true})
    customer_id?: string;

    @Column({nullable: true})
    blocked_at!: Date;

    @Column({nullable: true})
    deleted_at!: Date;

    @Column({nullable: true})
    full_name?: string;

    @Column({nullable: true})
    country?: string;

    @Column({nullable: true})
    deviceModel?: string;

    @Column({name: 'created_at'})
    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @Column({nullable: true})
    device_id?: string;

    @Column({nullable: true})
    device_model?: string;

    @Column({nullable: true})
    language?: string;

    @Column({nullable: true})
    app_version?: string;

    @Column({nullable: true})
    is_google_play?: boolean;
}