import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class GetProfileDto {
    @IsNotEmpty()
    @IsString()
    customer_id!: string;

    @IsOptional()
    language?: string;

}