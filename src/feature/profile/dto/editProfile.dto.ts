import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class EditProfileDto {
    @IsNotEmpty()
    @IsString()
    customer_id!: string;

    @IsString()
    @IsNotEmpty()
    first_name?: string;

    @IsString()
    @IsNotEmpty()
    last_name?: string;

    @IsOptional()
    @IsString()
    profile_image?: string;
}