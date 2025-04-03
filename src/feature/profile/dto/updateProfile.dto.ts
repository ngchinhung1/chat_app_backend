import {IsNotEmpty, IsOptional, IsString, IsBoolean} from 'class-validator';

export class UpdateProfileDto {
    @IsNotEmpty()
    @IsString()
    customer_id!: string;

    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsString()
    profile_image?: string;

    @IsOptional()
    @IsString()
    status_message?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}