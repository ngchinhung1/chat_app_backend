import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import {DevicePlatform} from "../entities/engagement_identifiers.entity";


export class CreateEngagementDto {
    @IsOptional()
    @IsString()
    notificationToken?: string;

    @IsOptional()
    @IsString()
    advertisementId?: string;

    @IsOptional()
    @IsString()
    deviceId?: string;

    @IsOptional()
    @IsEnum(DevicePlatform)
    devicePlatform?: DevicePlatform;

    @IsOptional()
    @IsString()
    deviceModel?: string;

    @IsOptional()
    @IsString()
    osVersion?: string;

    @IsOptional()
    @IsString()
    appVersion?: string;

    @IsOptional()
    @IsString()
    locale?: string;

    @IsOptional()
    @IsBoolean()
    isRegistered?: boolean;
}