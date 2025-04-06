import {
    Controller, Inject,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {StorageService} from "../../shared/storage/storage.service";

@Controller('upload')
export class UploadController {
    constructor(
        @Inject('StorageService')
        private readonly storageService: StorageService) {
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        const url = await this.storageService.upload(file); // local or s3
        const type = this.getFileType(file.mimetype);

        return {
            status: true,
            code: 200,
            data: {
                url,
                type,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
            },
            msg: 'File uploaded successfully',
        };
    }

    private getFileType(mime: string): 'image' | 'video' | 'file' {
        if (mime.startsWith('image/')) return 'image';
        if (mime.startsWith('video/')) return 'video';
        return 'file';
    }
}