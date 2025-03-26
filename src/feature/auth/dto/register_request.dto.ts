import {IsString, IsNotEmpty} from 'class-validator';

export class Register_requestDto {
    @IsString()
    @IsNotEmpty()
    country_code!: string;

    @IsString()
    @IsNotEmpty()
    phone_number!: string;
}