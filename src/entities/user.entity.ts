import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from 'typeorm';

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

    @Column({ name: 'is_verified', default: false })
    isVerified!: boolean;

    @Column({default: false})
    is_blocked!: boolean;

    @Column({default: false})
    is_deleted!: boolean;

    @Column({ nullable: true, unique: true })
    customer_id?: string;

    @Column({nullable: true})
    blocked_at!: Date;

    @Column({nullable: true})
    deleted_at!: Date;

    @Column({ name: 'created_at' })
    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}