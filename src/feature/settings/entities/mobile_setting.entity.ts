import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {DevicePlatform} from "../../engagement-identifier/entities/engagement_identifiers.entity";

@Entity()
export class MobileSetting {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column({ type: 'enum', enum: DevicePlatform })
    devicePlatform?: DevicePlatform;

    @Column()
    link!: string;

    @Column()
    mobileVersion!: string;

    @Column({ default: false })
    majorUpdate!: boolean;

    @Column({ default: false })
    isMaintenance!: boolean;
}
