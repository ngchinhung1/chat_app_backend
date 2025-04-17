import {
    Controller,
    Post,
    Req,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import {JwtAuthGuard} from '../../config/guards/jwtAuth.guard';
import {Request} from 'express';
import {FileInterceptor} from '@nestjs/platform-express';
import {I18nService} from "../../i18n/ i18n.service";
import {ChatUploadService} from "./chat-upload.service";

@Controller('upload-file')
export class ChatUploadController {
    constructor(
        private readonly uploadService: ChatUploadService,
        private readonly i18n: I18nService,
    ) {
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadChatFile(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
    ) {
        // service handles saving to disk or S3, returns a public URL
        const fileUrl = await this.uploadService.uploadChatFile(file);

        // pick up the language header if you need localized messages
        const language = (req.headers['language'] as string) || 'en';

        return {
            status: true,
            code: 200,
            data: {
                file_url: fileUrl,
            },
            msg: this.i18n.getMessage(language, 'FILE_UPLOADED_SUCCESSFULLY'),
        };
    }
}