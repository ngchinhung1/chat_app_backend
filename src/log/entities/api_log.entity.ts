import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from 'typeorm';

@Entity('api_logs')
export class ApiLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    endpoint!: string;

    @Column()
    method?: string;

    @Column({type: 'json', nullable: true})
    request_body: any;

    @Column({type: 'json', nullable: true})
    request_headers: any;

    @Column({type: 'json', nullable: true})
    response_body: any;

    @Column()
    status_code?: number;

    @Column({nullable: true})
    customer_id?: string;

    @Column({nullable: true})
    ip_address?: string;

    @Column()
    duration_ms?: number;

    @CreateDateColumn()
    timestamp!: Date;
}