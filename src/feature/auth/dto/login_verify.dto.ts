import {IsNotEmpty, IsString} from "class-validator";

export class LoginVerifyDto {
    @IsNotEmpty()
    @IsString()
    country_code!: string;

    @IsNotEmpty()
    @IsString()
    phone_number!: string;

    @IsNotEmpty()
    @IsString()
    otp!: string;
}
