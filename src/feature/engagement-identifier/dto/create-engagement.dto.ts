import {IsOptional, IsString, IsBoolean} from 'class-validator';


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
    @IsString()
    devicePlatform?: string;

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