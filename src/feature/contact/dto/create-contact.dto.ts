import {IsOptional, IsString} from "class-validator";

export class CreateContactDto {

    @IsOptional()
    @IsString()
    first_name?: string;

    @IsOptional()
    @IsString()
    last_name?: string;

    @IsOptional()
    @IsString()
    phone_number?: string;

    @IsOptional()
    @IsString()
    country_code?: string;

    @IsOptional()
    @IsString()
    customerId?: string;
}
