import {Body, Controller, Post} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {AuthRequestOtpDto} from "./dto/auth-request-otp.dto";
import {AuthVerifyOtpDto} from "./dto/auth-verify-otp.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('auth-request-otp')
    requestOtp(@Body() dto: AuthRequestOtpDto) {
        return this.authService.requestOtp(dto);
    }

    @Post('auth-verify-otp')
    verifyOtp(@Body() dto: AuthVerifyOtpDto) {
        return this.authService.verifyOtp(dto);
    }
}