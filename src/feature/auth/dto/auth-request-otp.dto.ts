import {IsNotEmpty, IsOptional, IsString, Matches} from 'class-validator';

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
    @IsString()
    devicePlatform?: string;

    @IsNotEmpty()
    @IsString()
    deviceId?: string;

    @IsNotEmpty()
    @IsString()
    deviceModel?: string;
}