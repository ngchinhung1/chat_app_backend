import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';
import {IsEnum, IsOptional} from "class-validator";

@Entity('otp_verifications')
export class OtpVerification {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    phone_number?: string;

    @Column()
    country_code?: string;

    @Column()
    otp?: string;

    @Column()
    device_id?: string;

    @IsOptional()
    @Column({nullable: true})
    devicePlatform?: string;

    @Column()
    device_model?: string;

    @Column({nullable: false})
    expires_at!: Date;

    @Column({name: 'is_verified', default: false})
    isVerified!: boolean;

    @Column({name: 'created_at'})
    @CreateDateColumn()
    createdAt!: Date;
}