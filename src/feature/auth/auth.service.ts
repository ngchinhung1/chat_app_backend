import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {OtpVerification} from './entities/otp_verification.entity';
import {User} from './entities/user.entity';
import {AuthRequestOtpDto} from './dto/auth-request-otp.dto';
import {AuthVerifyOtpDto} from './dto/auth-verify-otp.dto';
import {BaseResponse} from "../../utils/base-response";
import {EngagementIdentifier} from "../engagement-identifier/entities/engagement_identifiers.entity";
import {getCountryNameByCode} from "../../utils/country-mapping";
import {I18nService} from "../../i18n/ i18n.service";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(OtpVerification)
        private readonly otpRepo: Repository<OtpVerification>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
        @InjectRepository(EngagementIdentifier)
        private readonly engagementRepo: Repository<EngagementIdentifier>,
        private readonly i18n: I18nService,
    ) {
    }

    async requestOtp(dto: AuthRequestOtpDto, language: string | undefined) {
        if (!dto.countryCode || !dto.phoneNumber) {
            return new BaseResponse(false, 400, null, this.i18n.getMessage(language, 'COUNTRY_PHONE_EMPTY'));
        }

        // ✅ Sanitize countryCode
        const countryCode = dto.countryCode.replace(/^\+/, '');

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const otpEntity = this.otpRepo.create({
            phone_number: dto.phoneNumber,
            country_code: countryCode,
            otp: otp,
            device_id: dto.deviceId,
            devicePlatform: dto.devicePlatform,
            device_model: dto.deviceModel,
            expires_at: new Date(Date.now() + 5 * 60 * 1000), // OTP valid for 5 minutes
        });

        await this.otpRepo.save(otpEntity);

        return new BaseResponse(true, 200, {
            countryCode: countryCode,
            phoneNumber: dto.phoneNumber,
            otp: otp,
        }, this.i18n.getMessage(language, 'OTP_REQUESTED_SUCCESSFULLY'));
    }

    async verifyOtp(dto: AuthVerifyOtpDto, language: string | undefined) {
        if (!dto.countryCode || !dto.phoneNumber) {
            return new BaseResponse(false, 400, null, this.i18n.getMessage(language, 'COUNTRY_PHONE_EMPTY'));
        }

        const countryCode = dto.countryCode.replace(/^\+/, '');
        const now = new Date();

        const otpRecord = await this.otpRepo.findOne({
            where: {
                phone_number: dto.phoneNumber,
                country_code: countryCode,
                otp: dto.otp,
            },
        });

        if (!otpRecord) {
            return new BaseResponse(false, 400, null, this.i18n.getMessage(language, 'INVALID_OTP'));
        }

        if (otpRecord.expires_at && otpRecord.expires_at < now) {
            return new BaseResponse(false, 400, null, this.i18n.getMessage(language, 'OTP_EXPIRED'));
        }

        // Check if user exists
        let user = await this.userRepo.findOne({
            where: {
                phone_number: dto.phoneNumber,
                country_code: countryCode,
            },
        });

        let isNewUser = false;
        if (!user) {
            const customerId = await this.generateNextCustomerId();
            user = this.userRepo.create({
                country_code: countryCode,
                phone_number: dto.phoneNumber,
                device_id: dto.deviceId,
                language: dto.language,
                app_version: dto.appVersion,
                is_google_play: dto.isGooglePlay,
                devicePlatform: dto.devicePlatform,
                customer_id: customerId,
            });
            await this.userRepo.save(user);
            isNewUser = true;

            // ✅ Update engagement_identifiers if deviceId found
            const engagement = await this.engagementRepo.findOne({
                where: {deviceId: dto.deviceId},
            });
            if (engagement) {
                await this.engagementRepo.update(
                    {deviceId: dto.deviceId},
                    {customer_id: customerId, isRegistered: true},
                );
            }
        } else {
            // Existing user → update
            user.device_id = dto.deviceId;
            user.device_model = dto.deviceModel;
            user.language = dto.language;
            user.app_version = dto.appVersion;
            user.is_google_play = dto.isGooglePlay;
            user.devicePlatform = dto.devicePlatform;
            await this.userRepo.save(user);

            // ✅ Update engagement_identifiers if deviceId found
            const engagement = await this.engagementRepo.findOne({
                where: {deviceId: dto.deviceId},
            });
            if (engagement) {
                await this.engagementRepo.update(
                    {deviceId: dto.deviceId},
                    {isLogin: true},
                );
            }
        }

        const accessToken = this.jwtService.sign(
            {
                phoneNumber: dto.phoneNumber,
                countryCode: countryCode,
                customerId: user.customer_id,
            },
            {secret: process.env.JWT_SECRET, expiresIn: '7d'},
        );

        return new BaseResponse(true, 200, {
            country_code: countryCode,
            phone_number: dto.phoneNumber,
            token: accessToken,
            customer_id: user.customer_id,
            full_name: user.full_name || '',
            is_user: isNewUser,
            country: getCountryNameByCode(countryCode),
        }, isNewUser ? this.i18n.getMessage(language, 'REGISTER_SUCCESS') : this.i18n.getMessage(language, 'LOGIN_SUCCESS'));
    }

    private async generateNextCustomerId(): Promise<string> {
        const lastUser = await this.userRepo.createQueryBuilder('user')
            .orderBy('user.customer_id', 'DESC')
            .getOne();

        return lastUser
            ? (parseInt(<string>lastUser.customer_id) + 1).toString()
            : '100000';
    }
}