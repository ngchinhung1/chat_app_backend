import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CreateEngagementDto} from './dto/create-engagement.dto';
import {EngagementIdentifier} from "./entities/engagement_identifiers.entity";
import {BaseResponse} from "../../utils/base-response";
import {MobileSettingsDto} from "../settings/dto/mobile_setting.dto";
import {I18nService} from "../../i18n/ i18n.service";

@Injectable()
export class EngagementIdentifierService {
    constructor(
        @InjectRepository(EngagementIdentifier)
        private readonly engagementRepo: Repository<EngagementIdentifier>,
        private readonly i18n: I18nService,
    ) {
    }

    async createOrUpdate(dto: CreateEngagementDto, language: string | undefined) {
        const existing = await this.engagementRepo.findOne({where: {notificationToken: dto.notificationToken}});
        if (existing) {
            await this.engagementRepo.update(existing.id, dto);
            return new BaseResponse(true, 200, null, this.i18n.getMessage(language, 'UPDATED_SUCCESSFULLY'));
        }
        const engagement = this.engagementRepo.create(dto);
        await this.engagementRepo.save(engagement);
        return new BaseResponse(true, 201, null, this.i18n.getMessage(language, 'CREATED_SUCCESSFULLY'));
    }

    async findByDeviceId(deviceId: string | undefined) {
        return await this.engagementRepo.findOne({
            where: {deviceId: deviceId},
        });
    }

    async updateDeviceInfo(dto: MobileSettingsDto, customerId: string) {
        await this.engagementRepo.update(
            {deviceId: dto.deviceId},
            {
                notificationToken: dto.notificationToken,
                advertisementId: dto.advertisementId,
                devicePlatform: dto.devicePlatform,
                customer_id: customerId,
            },
        );
    }
}
