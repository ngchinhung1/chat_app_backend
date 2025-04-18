import {Injectable} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {StorageService} from "./storage.service";

@Injectable()
export class LocalStorageService implements StorageService {
    async upload(file: Express.Multer.File): Promise<string> {
        const uploadPath = path.resolve(__dirname, '../../../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, {recursive: true});
        }

        const filePath = path.join(uploadPath, file.originalname);
        fs.writeFileSync(filePath, file.buffer);

        return `uploads/${file.originalname}`;
    }
}