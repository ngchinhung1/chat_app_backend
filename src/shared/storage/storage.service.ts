export abstract class StorageService {
    abstract upload(file: Express.Multer.File): Promise<string>;
}