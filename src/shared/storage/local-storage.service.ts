import {Injectable} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageService {
    async uploadProfileImage(file: Express.Multer.File): Promise<string> {
        const uploadPath = path.join(__dirname, '../../uploads/profile');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, {recursive: true});

        const filePath = path.join(uploadPath, file.originalname);
        fs.writeFileSync(filePath, file.buffer);
        return `/uploads/profile/${file.originalname}`;
    }
}