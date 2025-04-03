import {Controller, Post, Body, UseGuards, Req, UseInterceptors, UploadedFile} from '@nestjs/common';
import {ProfileService} from './profile.service';
import {UpdateProfileDto} from './dto/updateProfile.dto';
import {JwtAuthGuard} from '../../config/guards/jwtAuth.guard';
import {Request} from 'express';
import {FileInterceptor} from "@nestjs/platform-express";
import {I18nService} from "../../i18n/ i18n.service";

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
}