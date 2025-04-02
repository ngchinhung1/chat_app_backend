import {JwtModule} from '@nestjs/jwt';
import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./entities/user.entity";
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {OtpVerification} from "./entities/otp_verification.entity";
import {JwtStrategy} from "../../config/jwt.strategy";
import {EngagementIdentifier} from "../engagement-identifier/entities/engagement_identifiers.entity";
import {I18nService} from "../../i18n/ i18n.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, OtpVerification, EngagementIdentifier]),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {expiresIn: '1d'},
        }),
    ],
    providers: [AuthService, JwtStrategy, I18nService],
    controllers: [AuthController],
    exports: [JwtModule],
})
export class AuthModule {
}
