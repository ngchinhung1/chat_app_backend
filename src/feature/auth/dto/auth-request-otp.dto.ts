import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class AuthRequestOtpDto {
    @IsNotEmpty({ message: 'Country code cannot be empty' })
    @IsString({ message: 'Country code must be a string' })
    @Matches(/^\+?\d+$/, { message: 'Country code must contain only digits and may start with a plus sign' })
    countryCode?: string;

    @IsNotEmpty({ message: 'Phone number cannot be empty' })
    @IsString({ message: 'Phone number must be a string' })
    @Matches(/^\d+$/, { message: 'Phone number must contain only digits' })
    phoneNumber?: string;
}