import {IsEnum, IsNotEmpty, IsOptional, IsString, Matches} from 'class-validator';
import {DevicePlatform} from "../../engagement-identifier/entities/engagement_identifiers.entity";

export class AuthRequestOtpDto {
    @IsNotEmpty()
    @IsString()
    @Matches(/^\+?\d+$/)
    countryCode?: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\d+$/)
    phoneNumber?: string;

    @IsOptional()
    @IsEnum(DevicePlatform)
    devicePlatform?: DevicePlatform;

    @IsNotEmpty()
    @IsString()
    deviceId?: string;

    @IsNotEmpty()
    @IsString()
    deviceModel?: string;
}