import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ProfileController} from './profile.controller';
import {ProfileService} from './profile.service';
import {Profile} from "./entities/profile.entity";
import {I18nService} from "../../i18n/ i18n.service";
import {S3StorageService} from "../../shared/storage/s3-storage.service";
import {LocalStorageService} from "../../shared/storage/local-storage.service";
import {UploadedFile} from '../../shared/entities/uploaded_files.entity';
import {User} from "../auth/entities/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Profile, UploadedFile, User])],
    controllers: [ProfileController],
    providers: [ProfileService, I18nService, S3StorageService, LocalStorageService],
    exports: [ProfileService],
})
export class ProfileModule {
}
