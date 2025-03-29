import {Injectable} from '@nestjs/common';
import {AuthRequestOtpDto} from './dto/auth-request-otp.dto';
import {AuthVerifyOtpDto} from './dto/auth-verify-otp.dto';
import {BaseResponse} from '../../utils/base-response';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {OtpVerification} from "./entities/otp_verification.entity";
import {User} from "./entities/user.entity";
import {EngagementIdentifier} from "../engagement-identifier/entities/engagement_identifiers.entity";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(OtpVerification)
        private readonly otpRepo: Repository<OtpVerification>,
        @InjectRepository(EngagementIdentifier)
        private readonly engagementRepo: Repository<EngagementIdentifier>,
    ) {
    }

    async requestOtp(dto: AuthRequestOtpDto) {
        // Validate input
        if (!dto.countryCode || !dto.phoneNumber) {
            throw new Error('Country code and phone number cannot be null or empty');
        }

        // Remove leading '+' from countryCode, if present
        const sanitizedCountryCode = dto.countryCode.replace(/^\+/, '');

        // Concatenate country code and phone number to create customerId
        const customerId = `${sanitizedCountryCode}${dto.phoneNumber}`;

        // Check if user exists
        const existingUser = await this.userRepo.findOne({
            where: {customer_id: customerId},
        });

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Create OTP verification record
        const otpRecord = this.otpRepo.create({
            country_code: sanitizedCountryCode,
            phone_number: dto.phoneNumber,
            otp,
            expires_at: new Date(Date.now() + 5 * 60 * 1000), // Expires in 5 minutes
        });

        // Save OTP verification record
        await this.otpRepo.save(otpRecord);

        // Return response
        return BaseResponse.success(
            {
                is_user: !!existingUser,
                otp,
            },
            'OTP sent successfully',
        );
    }

    async verifyOtp(dto: AuthVerifyOtpDto): Promise<BaseResponse<any>> {
        const customerId = `${dto.countryCode}${dto.phoneNumber}`;
        const otpRecord = await this.otpRepo.findOne({
            where: {
                country_code: dto.countryCode,
                phone_number: dto.phoneNumber,
                otp: dto.otp,
            },
        });

        if (!otpRecord) {
            return BaseResponse.error('Invalid OTP', 400);
        }

        let user = await this.userRepo.findOne({
            where: {
                phone_number: dto.phoneNumber,
                country_code: dto.countryCode,
            },
        });

        if (!user) {
            const nextCustomerId = await this.generateNextCustomerId();
            user = this.userRepo.create({
                customer_id: nextCustomerId,
                phone_number: dto.phoneNumber,
                country_code: dto.countryCode,
            });
            await this.userRepo.save(user);
        }

        await this.engagementRepo.update(
            {customer_id: customerId},
            {isRegistered: true},
        );

        return BaseResponse.success(
            {
                phone_number: `${dto.countryCode}${dto.phoneNumber}`,
                customer_id: user.customer_id,
            },
            'OTP verified successfully',
        );
    }

    private async generateNextCustomerId(): Promise<string> {
        const lastUser = await this.userRepo.findOne({
            where: {},
            order: {customer_id: 'DESC'},
        });
        return lastUser ? (parseInt(<string>lastUser.customer_id) + 1).toString() : '100000';
    }
}