import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class MobileSettingsDto {
    @IsNotEmpty()
    @IsString()
    devicePlatform?: string;

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
