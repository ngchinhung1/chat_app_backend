import {IsString, IsNotEmpty} from 'class-validator';

export class LoginRequestDto {
    @IsNotEmpty()
    @IsString()
    country_code!: string;

    @IsNotEmpty()
    @IsString()
    phone_number!: string;
}
