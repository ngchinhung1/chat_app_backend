import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class MobileSettingsDto {
    @IsOptional()
    @IsString()
    devicePlatform?: string;

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
    customer_id!: string;
}
