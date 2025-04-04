import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class MobileSetting {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    devicePlatform?: string;

    @Column()
    link!: string;

    @Column()
    mobileVersion!: string;

    @Column({default: false})
    majorUpdate!: boolean;

    @Column({default: false})
    isMaintenance!: boolean;
}
