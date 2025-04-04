import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {MobileSetting} from "./entities/mobile_setting.entity";
import {User} from "../auth/entities/user.entity";
import {MobileSettingsDto} from "./dto/mobile_setting.dto";


@Injectable()
export class MobileSettingsService {
    constructor(
        @InjectRepository(MobileSetting)
        private readonly settingRepo: Repository<MobileSetting>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {
    }

    async upsertAndReturnUserSettings(dto: MobileSettingsDto): Promise<any> {
        const {
            customer_id,
            deviceId,
            devicePlatform,
            advertisementId,
            notificationToken,
        } = dto;

        // 1. Update user
        await this.userRepo.update(
            {customer_id},
            {
                deviceId,
                devicePlatform,
                advertisementId,
                notificationToken,
            },
        );

        // 2. Load base mobile setting (based on platform)
        const setting = await this.settingRepo.findOne({
            where: {devicePlatform},
            select: [
                'link',
                'mobileVersion',
                'majorUpdate',
                'isMaintenance',
            ],
        });

        return setting || {
            link: '',
            devicePlatform,
            mobile_version: '',
            major_update: false,
            is_maintenance: false,
        };
    }
}
