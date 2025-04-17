import {Injectable, Inject} from '@nestjs/common';
import {StorageService} from "../../shared/storage/storage.service";

@Injectable()
export class ChatUploadService {
    constructor(
        @Inject('StorageService')
        private readonly storage: StorageService,
    ) {
    }

    /**
     * Uploads the incoming file (buffer) either to S3 or local,
     * depending on STORAGE_DRIVER, and returns its public URL.
     */
    async uploadChatFile(file: Express.Multer.File): Promise<string> {
        return await this.storage.upload(file);
    }
}
