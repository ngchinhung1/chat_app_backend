import {IsBoolean, IsNotEmpty, IsOptional, IsString} from 'class-validator';

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
    @IsString()
    devicePlatform?: string;

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