import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('contacts')
export class Contact {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    customer_id!: string;

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
}