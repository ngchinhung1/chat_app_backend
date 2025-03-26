import { IsString, IsNotEmpty } from 'class-validator';

export class Register_verifyDto {
    @IsString()
    @IsNotEmpty()
    country_code!: string;

    @IsString()
    @IsNotEmpty()
    phone_number!: string;

    @IsString()
    @IsNotEmpty()
    otp!: string;
}
