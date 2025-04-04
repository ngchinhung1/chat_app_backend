import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ApiLog} from './entities/api_log.entity';

@Injectable()
export class LogService {
    constructor(
        @InjectRepository(ApiLog)
        private readonly logRepo: Repository<ApiLog>
    ) {
    }

    async logRequest(data: Partial<ApiLog>) {
        const log = this.logRepo.create(data);
        await this.logRepo.save(log);
    }

    async logError(data: Partial<ApiLog>) {
        const log = this.logRepo.create({...data, status_code: data.status_code || 500});
        await this.logRepo.save(log);
    }
}