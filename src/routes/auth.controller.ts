import {Controller, Post, Body, UseGuards, Patch} from '@nestjs/common';
import {AuthService} from '../feature/auth/auth.service';
import {AuthGuard} from '@nestjs/passport';
import {Register_requestDto} from '../feature/auth/dto/register_request.dto';
import {Register_verifyDto} from "../feature/auth/dto/register_verify.dto";
import {UpdateProfileDto} from "../feature/profile/dto/updateProfile.dto";
import {LoginVerifyDto} from "../feature/auth/dto/login_verify.dto";
import {LoginRequestDto} from "../feature/auth/dto/login_request.dto";


// ✅ Api Endpoints
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    // ✅ Register Route (Public)
    @Post('register-request')
    async registerRequest(@Body() dto: Register_requestDto) {
        return this.authService.registerRequest(dto);
    }

    @Post('register-verify')
    async registerVerify(@Body() dto: Register_verifyDto) {
        return this.authService.registerVerify(dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('update-profile')
    async updateProfile(@Body() dto: UpdateProfileDto) {
        return this.authService.updateProfile(dto);
    }

    @Post('login-request')
    loginRequest(@Body() dto: LoginRequestDto) {
        return this.authService.loginRequest(dto);
    }

    @Post('login-verify')
    loginVerify(@Body() dto: LoginVerifyDto) {
        return this.authService.loginVerify(dto);
    }

}