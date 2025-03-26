import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../../entities/user.entity";
import {MoreThan, Repository} from "typeorm";
import {Register_requestDto} from "./dto/register_request.dto";
import {Register_verifyDto} from "./dto/register_verify.dto";
import {UpdateProfileDto} from "../profile/dto/updateProfile.dto";
import {OtpVerification} from "../../entities/otp_verification.entity";
import {JwtService} from "@nestjs/jwt";
import {LoginRequestDto} from "./dto/login_request.dto";
import {LoginVerifyDto} from "./dto/login_verify.dto";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(OtpVerification) private otpRepo: Repository<OtpVerification>,
        private jwtService: JwtService
    ) {
    }

    async registerRequest(registerDto: Register_requestDto): Promise<any> {
        let {country_code, phone_number} = registerDto;

        // 1. Validate input: Only digits allowed
        const digitOnly = /^\d+$/;

        // Strip '+' if exists (e.g. +60 → 60)
        country_code = country_code.replace('+', '');

        if (!digitOnly.test(country_code)) {
            throw new BadRequestException('country_code must contain digits only (no special characters)');
        }

        if (!digitOnly.test(phone_number)) {
            throw new BadRequestException('phone_number must contain digits only');
        }

        // 2. Check if user already exists
        const existingUser = await this.userRepo.findOne({where: {phone_number}});
        if (existingUser) {
            throw new BadRequestException('User already exists');
        }

        // 3. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        // 4. Save OTP entry
        await this.otpRepo.save({
            phone_number,
            country_code, // sanitized version
            otp,
            expires_at: expiresAt,
            isVerified: false,
        });

        console.log(`Register OTP for +${country_code}${phone_number}: ${otp}`);

        return {
            message: 'OTP sent successfully',
            otp: otp, // remove in prod
        };
    }

    async registerVerify(dto: Register_verifyDto): Promise<any> {
        let {country_code, phone_number, otp} = dto;

        country_code = country_code.replace('+', '');

        const digitOnly = /^\d+$/;
        if (!digitOnly.test(country_code)) {
            throw new BadRequestException('country_code must be digits only');
        }
        if (!digitOnly.test(phone_number)) {
            throw new BadRequestException('phone_number must be digits only');
        }

        const otpEntry = await this.otpRepo.findOne({
            where: {
                country_code,
                phone_number,
                otp,
                isVerified: false,
                expires_at: MoreThan(new Date()),
            },
        });

        if (!otpEntry) throw new BadRequestException('Invalid or expired OTP');

        //Check if user already exists
        const existingUser = await this.userRepo.findOne({
            where: {country_code, phone_number},
        });

        if (existingUser) throw new BadRequestException('User already exists');

        //Get latest customer_id
        const latestUser = await this.userRepo
            .createQueryBuilder('user')
            .where('user.customer_id IS NOT NULL')
            .orderBy('user.customer_id', 'DESC')
            .getOne();

        const lastCustomerId = latestUser?.customer_id
            ? parseInt(latestUser.customer_id)
            : 1000000;

        const newCustomerId = (lastCustomerId + 1).toString();

        //Create new user
        const newUser = this.userRepo.create({
            country_code,
            phone_number,
            isVerified: true,
            customer_id: newCustomerId,
        });

        const user = await this.userRepo.save(newUser);

        //Mark OTP as used
        otpEntry.isVerified = true;
        await this.otpRepo.save(otpEntry);

        //Generate JWT
        const payload = {sub: user.customer_id, phone: user.phone_number};
        const token = this.jwtService.sign(payload);

        return {
            message: 'Phone number verified and user created successfully',
            token,
            customer_id: newCustomerId,
            country_code: user.country_code,
            phone_number: user.phone_number,
        };
    }

    async updateProfile(dto: UpdateProfileDto): Promise<any> {
        const {customer_id, name, profile_image} = dto;

        const user = await this.userRepo.findOne({where: {customer_id: customer_id}});
        if (!user) throw new NotFoundException('User not found');
        if (!user.isVerified) throw new BadRequestException('User is not verified');

        user.name = name;
        user.profile_image = profile_image || user.profile_image;

        await this.userRepo.save(user);
        return {message: 'Profile updated successfully'};
    }

    async loginRequest(dto: LoginRequestDto): Promise<any> {
        let {country_code, phone_number} = dto;

        // Sanitize
        country_code = country_code.replace('+', '');
        const digitOnly = /^\d+$/;
        if (!digitOnly.test(country_code) || !digitOnly.test(phone_number)) {
            throw new BadRequestException('Invalid country code or phone number');
        }

        // Find existing user
        const user = await this.userRepo.findOne({where: {country_code, phone_number}});
        if (!user || !user.isVerified) {
            throw new BadRequestException('User not found or not verified');
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Save OTP
        await this.otpRepo.save({
            phone_number,
            country_code,
            otp,
            expires_at: expiresAt,
            is_verified: false,
        });

        console.log(`Login OTP for +${country_code}${phone_number}: ${otp}`);

        return {
            message: 'OTP sent successfully for login',
            otp, // remove in prod
        };
    }

    async loginVerify(dto: LoginVerifyDto): Promise<any> {
        let {country_code, phone_number, otp} = dto;

        country_code = country_code.replace('+', '');

        const otpEntry = await this.otpRepo.findOne({
            where: {
                country_code,
                phone_number,
                otp,
                isVerified: false,
                expires_at: MoreThan(new Date()),
            },
        });

        if (!otpEntry) throw new BadRequestException('Invalid or expired OTP');

        const user = await this.userRepo.findOne({where: {country_code, phone_number}});
        if (!user || !user.isVerified) throw new NotFoundException('User not found or not verified');

        otpEntry.isVerified = true;
        await this.otpRepo.save(otpEntry);

        // JWT
        const payload = {sub: user.customer_id, phone: user.phone_number};
        const token = this.jwtService.sign(payload);

        return {
            message: 'Login successful',
            token,
            customer_id: user.customer_id,
            country_code: user.country_code,
            phone_number: user.phone_number,
        };
    }

}