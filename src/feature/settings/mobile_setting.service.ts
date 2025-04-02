import {Injectable, Req} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {MobileSetting} from "./entities/mobile_setting.entity";
import {DevicePlatform} from "../engagement-identifier/entities/engagement_identifiers.entity";


@Injectable()
export class MobileSettingsService {
    constructor(
        @InjectRepository(MobileSetting)
        private readonly settingRepo: Repository<MobileSetting>,
    ) {
    }

    async getSettingByPlatform(devicePlatform: DevicePlatform | undefined): Promise<MobileSetting | null> {
        if (!devicePlatform) return null;
        return await this.settingRepo.findOne({where: {devicePlatform}});
    }
}
