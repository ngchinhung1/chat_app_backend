import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
