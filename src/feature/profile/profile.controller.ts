import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {ProfileService} from './profile.service';
import {UpdateProfileDto} from './dto/updateProfile.dto';
import {JwtAuthGuard} from '../../config/guards/jwtAuth.guard';
import {Request} from 'express';
import {FileInterceptor} from "@nestjs/platform-express";
import {I18nService} from "../../i18n/ i18n.service";
import {EditProfileDto} from "./dto/editProfile.dto";

@Controller('profile')
export class ProfileController {
    constructor(
        private readonly profileService: ProfileService,
        private readonly i18n: I18nService,
    ) {
    }

    @Post('update-profile')
    @UseGuards(JwtAuthGuard)
    async updateProfile(@Body() dto: UpdateProfileDto, @Req() req: Request) {
        return this.profileService.updateProfile(dto, req.language);
    }

    @Post('upload-profile-image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfileImage(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
        const imageUrl = await this.profileService.uploadProfileImage(file);
        const language = req.headers['language'] as string || 'en';
        return {
            status: true,
            code: 200,
            data: {
                image_url: imageUrl,
            },
            msg: this.i18n.getMessage(language, 'IMAGE_UPLOADED_SUCCESSFULLY'),
        };
    }

    @Post('edit-profile')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    @HttpCode(HttpStatus.OK)
    async editProfile(
        @Body() dto: EditProfileDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
    ) {
        const ownerId = req.user.customer_id;
        const language = (req.headers['language'] as string) || 'en';
        dto.customer_id = ownerId;

        try {
            if (file) {
                dto.profile_image = await this.profileService.uploadProfileImage(file);
            }
            return await this.profileService.editProfile(dto, language);
        } catch (error: any) {
            return {
                status: false,
                code: 400,
                data: null,
                msg:
                    (error.response?.msg as string) ||
                    this.i18n.getMessage(language, 'USER_NOT_FOUND_CALL_FOR_DOWNLOAD_APP'),
            };
        }
    }

    @Post('get-profile')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getProfile(@Req() req: any) {
        const customer_id = req.user.customer_id;
        const language = (req.headers['language'] as string) || 'en';

        try {
            return await this.profileService.getProfile(
                customer_id,
                language,
            );
        } catch (error: any) {
            return {
                status: false,
                code: 400,
                data: null,
                msg:
                    (error.response?.msg as string) ||
                    this.i18n.getMessage(language, 'PROFILE_FETCH_FAILED'),
            };
        }
    }
}