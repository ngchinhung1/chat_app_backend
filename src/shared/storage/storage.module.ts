import {Module, Global} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {LocalStorageService} from './local-storage.service';
import {S3StorageService} from './s3-storage.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        LocalStorageService,
        S3StorageService,
        {
            provide: 'StorageService',
            inject: [ConfigService, LocalStorageService, S3StorageService],
            useFactory: (
                config: ConfigService,
                localStorageService: LocalStorageService,
                s3StorageService: S3StorageService,
            ) => {
                return config.get('STORAGE_DRIVER') === 's3'
                    ? s3StorageService
                    : localStorageService;
            },
        },
    ],
    exports: ['StorageService'],
})
export class StorageModule {
}