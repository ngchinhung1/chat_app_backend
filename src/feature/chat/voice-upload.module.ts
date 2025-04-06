import {Module} from '@nestjs/common';
import {VoiceUploadController} from './voice-upload.controller';
import {StorageModule} from "../../shared/storage/storage.module";

@Module({
    imports: [StorageModule],
    controllers: [VoiceUploadController],
})
export class VoiceUploadModule {
}
