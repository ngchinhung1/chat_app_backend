import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../../auth/entities/user.entity';

@Entity('profiles')
export class Profile {
    @PrimaryColumn()
    customer_id!: string;

    @OneToOne(() => UserEntity)
    @JoinColumn({ name: 'customer_id', referencedColumnName: 'customer_id' })
    user!: UserEntity;

    @Column({ nullable: true })
    first_name?: string;

    @Column({ nullable: true })
    last_name?: string;

    @Column({ nullable: true })
    profile_image?: string;

    @Column({ nullable: true })
    status_message?: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ default: true })
    is_active?: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}