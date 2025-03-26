import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('otp_verifications')
export class OtpVerification {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    phone_number!: string;

    @Column()
    country_code!: string;

    @Column()
    otp?: string;

    @Column()
    expires_at?: Date;

    @Column({ name: 'is_verified', default: false })
    isVerified!: boolean;

    @Column({ name: 'created_at' })
    @CreateDateColumn()
    createdAt!: Date;
}