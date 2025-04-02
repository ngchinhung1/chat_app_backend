import {IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import {DevicePlatform} from "../../engagement-identifier/entities/engagement_identifiers.entity";

export class AuthVerifyOtpDto {
    @IsNotEmpty()
    @IsString()
    countryCode?: string;

    @IsNotEmpty()
    @IsString()
    phoneNumber?: string;

    @IsNotEmpty()
    @IsString()
    otp?: string;

    @IsOptional()
    @IsEnum(DevicePlatform)
    devicePlatform?: DevicePlatform;

    @IsOptional()
    @IsString()
    deviceId?: string;

    @IsOptional()
    @IsString()
    deviceModel?: string;

    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsString()
    appVersion?: string;

    @IsOptional()
    @IsBoolean()
    isGooglePlay?: boolean;
}