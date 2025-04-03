import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {UpdateProfileDto} from './dto/updateProfile.dto';
import {BaseResponse} from '../../utils/base-response';
import {Profile} from "./entities/profile.entity";
import {I18nService} from "../../i18n/ i18n.service";
import {LocalStorageService} from "../../shared/storage/local-storage.service";
import {S3StorageService} from "../../shared/storage/s3-storage.service";
import {UploadedFile} from '../../shared/entities/uploaded_files.entity';
import {User} from "../auth/entities/user.entity";

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(Profile)
        private readonly profileRepo: Repository<Profile>,
        private readonly i18n: I18nService,
        private readonly localStorageService: LocalStorageService,
        private readonly s3StorageService: S3StorageService,
        @InjectRepository(UploadedFile)
        private readonly uploadedFileRepo: Repository<UploadedFile>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
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
                name: dto.name,
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
                {name: dto.name},
            );

            return new BaseResponse(true, 201, {
                customer_id: profile.customer_id,
                name: profile.name,
                profile_image: profile.profile_image,
                status_message: profile.status_message,
                description: profile.description,
                is_active: profile.is_active,
                created_at: profile.created_at,
                updated_at: profile.updated_at,
            }, this.i18n.getMessage(language, 'USER_PROFILE_CREATED_SUCCESSFULLY'));
        } else {
            // Update existing
            profile.name = dto.name || profile.name;
            profile.profile_image = dto.profile_image || profile.profile_image;
            profile.status_message = dto.status_message || profile.status_message;
            profile.description = dto.description || profile.description;
            profile.is_active = dto.is_active !== undefined ? dto.is_active : profile.is_active;
            profile.updated_at = new Date();

            await this.profileRepo.save(profile);

            // Update Users table name
            if (dto.name) {
                await this.userRepo.update(
                    {customer_id: dto.customer_id},
                    {name: dto.name},
                );
            }

            return new BaseResponse(true, 200, {
                customer_id: profile.customer_id,
                name: profile.name,
                profile_image: profile.profile_image,
                status_message: profile.status_message,
                description: profile.description,
                is_active: profile.is_active,
                updated_at: profile.updated_at,
            }, this.i18n.getMessage(language, 'USER_PROFILE_UPDATED_SUCCESSFULLY'));
        }
    }

    async uploadProfileImage(file: Express.Multer.File): Promise<string> {
        let imageUrl = '';

        if (process.env.STORAGE_DRIVER === 's3') {
            imageUrl = await this.s3StorageService.uploadProfileImage(file);
        } else {
            imageUrl = await this.localStorageService.uploadProfileImage(file);
        }

        // Save into uploaded_files table
        await this.uploadedFileRepo.save({
            path: imageUrl,
        });

        return imageUrl;
    }
}