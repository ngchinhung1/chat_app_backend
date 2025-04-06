import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile, Inject,
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {StorageService} from "../../shared/storage/storage.service";


@Controller('voice')
export class VoiceUploadController {
    constructor(
        @Inject('StorageService')
        private readonly storageService: StorageService) {
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadVoice(@UploadedFile() file: Express.Multer.File): Promise<{ url: string }> {
        const url = await this.storageService.upload(file);
        return {url};
    }
}