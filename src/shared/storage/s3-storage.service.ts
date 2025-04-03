import {Injectable} from '@nestjs/common';
import {S3Client, PutObjectCommand} from '@aws-sdk/client-s3';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class S3StorageService {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;

    constructor(private readonly configService: ConfigService) {
        this.s3Client = new S3Client({
            region: this.configService.get<string>('S3_REGION'),
            credentials: {
                accessKeyId: this.configService.get<string>('S3_ACCESS_KEY')!,
                secretAccessKey: this.configService.get<string>('S3_SECRET_KEY')!,
            },
        });
        this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME') || 'default-bucket';
    }

    async uploadProfileImage(file: Express.Multer.File): Promise<string> {
        const fileName = `profile/${Date.now()}-${file.originalname}`;

        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        // Return Public URL (Optional)
        const region = this.configService.get<string>('S3_REGION');
        const url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${fileName}`;
        return url;
    }
}