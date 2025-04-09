import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {UserEntity} from "../../auth/entities/user.entity";

@Entity('contacts')
export class Contact {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({nullable: true})
    customer_id?: string;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'ownerId' })
    owner!: UserEntity;

    @Column()
    first_name?: string;

    @Column()
    last_name?: string;

    @Column()
    phone_number?: string;

    @Column()
    country_code?: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}