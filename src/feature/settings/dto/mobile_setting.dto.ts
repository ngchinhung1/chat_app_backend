import {IsEnum, IsNotEmpty, IsOptional, IsString} from "class-validator";
import {DevicePlatform} from "../../engagement-identifier/entities/engagement_identifiers.entity";

export class MobileSettingsDto {
    @IsNotEmpty()
    @IsEnum(DevicePlatform)
    devicePlatform?: DevicePlatform;

    @IsNotEmpty()
    @IsString()
    notificationToken?: string;

    @IsOptional()
    @IsString()
    advertisementId?: string;

    @IsOptional()
    @IsString()
    deviceId?: string;
}
