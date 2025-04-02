import {Body, Controller, Post, Req, UseGuards} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {AuthRequestOtpDto} from "./dto/auth-request-otp.dto";
import {AuthVerifyOtpDto} from "./dto/auth-verify-otp.dto";
import {ApiKeyGuard} from "../../config/guards/api-key.guard";
import {Request} from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @UseGuards(ApiKeyGuard)
    @Post('auth-request-otp')
    async requestOtp(@Body() dto: AuthRequestOtpDto, @Req() req: Request) {
        return this.authService.requestOtp(dto, req.language);
    }

    @UseGuards(ApiKeyGuard)
    @Post('auth-verify-otp')
    async verifyOtp(@Body() dto: AuthVerifyOtpDto, @Req() req: Request) {
        return this.authService.verifyOtp(dto, req.language);
    }
}