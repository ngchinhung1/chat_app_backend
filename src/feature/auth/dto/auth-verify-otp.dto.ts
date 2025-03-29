import {IsBoolean, IsNotEmpty, IsString} from 'class-validator';

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

    @IsNotEmpty()
    @IsBoolean()
    isUser?: boolean;
}