import {JwtModule} from '@nestjs/jwt';
import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../../entities/user.entity";
import {AuthController} from "../../routes/auth.controller";
import {AuthService} from "./auth.service";
import {OtpVerification} from "../../entities/otp_verification.entity";
import {JwtStrategy} from "../../config/jwt.strategy";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, OtpVerification]),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {expiresIn: '1d'},
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [JwtModule],
})
export class AuthModule {
}
