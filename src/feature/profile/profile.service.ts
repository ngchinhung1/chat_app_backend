import {HttpException, Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {UpdateProfileDto} from './dto/updateProfile.dto';
import {BaseResponse} from '../../utils/base-response';
import {Profile} from "./entities/profile.entity";
import {I18nService} from "../../i18n/ i18n.service";
import {UploadedFile} from '../../shared/entities/uploaded_files.entity';
import {UserEntity} from "../auth/entities/user.entity";
import {StorageService} from "../../shared/storage/storage.service";

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(Profile)
        private readonly profileRepo: Repository<Profile>,
        private readonly i18n: I18nService,
        @InjectRepository(UploadedFile)
        private readonly uploadedFileRepo: Repository<UploadedFile>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @Inject('StorageService')
        private readonly storageService: StorageService,
    ) {
    }

    async updateProfile(dto: UpdateProfileDto, language: string | undefined) {
        let profile = await this.profileRepo.findOne({
            where: {customer_id: dto.customer_id},
        });

        if (!profile) {
            // Create new profile
            profile = this.profileRepo.create({
                customer_id: dto.customer_id,
                first_name: dto.first_name,
                last_name: dto.last_name,
                profile_image: dto.profile_image,
                status_message: dto.status_message,
                description: dto.description,
                is_active: dto.is_active !== undefined ? dto.is_active : true,
                created_at: new Date(),
                updated_at: new Date(),
            });

            await this.profileRepo.save(profile);

            // Also update Users table
            await this.userRepo.update(
                {customer_id: dto.customer_id},
                {
                    first_name: dto.first_name,
                    last_name: dto.last_name,
                    profile_image: dto.profile_image
                },
            );

            return new BaseResponse(true, 201, {
                customer_id: profile.customer_id,
                first_name: profile.first_name,
                last_name: profile.last_name,
                profile_image: profile.profile_image,
                status_message: profile.status_message,
                description: profile.description,
                is_active: profile.is_active,
                created_at: profile.created_at,
                updated_at: profile.updated_at,
            }, this.i18n.getMessage(language, 'USER_PROFILE_CREATED_SUCCESSFULLY'));
        } else {
            // Update existing
            profile.first_name = dto.first_name || profile.first_name;
            profile.last_name = dto.last_name || profile.last_name;
            profile.profile_image = dto.profile_image || profile.profile_image;
            profile.status_message = dto.status_message || profile.status_message;
            profile.description = dto.description || profile.description;
            profile.is_active = dto.is_active !== undefined ? dto.is_active : profile.is_active;
            profile.updated_at = new Date();

            await this.profileRepo.save(profile);

            // Update Users table name
            if (dto.first_name && dto.last_name) {
                await this.userRepo.update(
                    {customer_id: dto.customer_id},
                    {
                        first_name: dto.first_name,
                        last_name: dto.last_name,
                        profile_image: dto.profile_image
                    },
                );
            }

            return new BaseResponse(true, 200, {
                customer_id: profile.customer_id,
                first_name: profile.first_name,
                last_name: profile.last_name,
                profile_image: profile.profile_image,
                status_message: profile.status_message,
                description: profile.description,
                is_active: profile.is_active,
                updated_at: profile.updated_at,
            }, this.i18n.getMessage(language, 'USER_PROFILE_UPDATED_SUCCESSFULLY'));
        }
    }

    async uploadProfileImage(file: Express.Multer.File): Promise<string> {
        const imageUrl = await this.storageService.upload(file);

        // Save to uploaded_files table
        await this.uploadedFileRepo.save({
            path: imageUrl,
        });

        return imageUrl;
    }

    async editProfile(
        dto: UpdateProfileDto,
        language: string | undefined,
    ): Promise<BaseResponse<{}>> {
        // 1. Verify user exists
        const user = await this.userRepo.findOne({
            where: {customer_id: dto.customer_id},
        });
        if (!user) {
            throw new HttpException(
                {
                    status: false,
                    msg: this.i18n.getMessage(language, 'USER_NOT_FOUND'),
                    code: 400,
                    data: {},
                },
                400,
            );
        }

        user.first_name = dto.first_name;
        user.last_name = dto.last_name;
        user.profile_image = dto.profile_image;
        await this.userRepo.save(user);

        // 2. Load or create profile record
        let profile = await this.profileRepo.findOne({
            where: {customer_id: dto.customer_id},
        });
        if (!profile) {
            profile = this.profileRepo.create({customer_id: dto.customer_id});
        }

        // 3. Assign new values
        profile.first_name = dto.first_name;
        profile.last_name = dto.last_name;
        profile.profile_image = dto.profile_image;

        // 4. Persist
        profile = await this.profileRepo.save(profile);

        return {
            status: true,
            code: 200,
            data: {
                customer_id: profile.customer_id,
                first_name: profile.first_name,
                last_name: profile.last_name,
                profile_image: profile.profile_image,
                updated_at: profile.updated_at,
            },
            msg: this.i18n.getMessage(language, 'USER_PROFILE_UPDATED_SUCCESSFULLY'),
        };
    }

    async getProfile(
        customer_id: string,
        language: string | undefined,
    ): Promise<BaseResponse<{
        customer_id: string;
        first_name: string;
        last_name: string;
        profile_image: string | null;
    }>> {
        const profile = await this.profileRepo.findOne({
            where: {customer_id},
        });

        if (!profile) {
            throw new HttpException(
                {
                    status: false,
                    code: 404,
                    data: {},
                    msg: this.i18n.getMessage(language, 'USER_NOT_FOUND'),
                },
                400,
            );
        }

        return {
            status: true,
            code: 200,
            data: {
                customer_id: profile.customer_id,
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                profile_image: profile.profile_image || null,
            },
            msg: this.i18n.getMessage(language, 'PROFILE_FETCH_SUCCESS'),
        };
    }
}