import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ApiLog} from './entities/api_log.entity';
import {LogService} from './log.service';

@Module({
    imports: [TypeOrmModule.forFeature([ApiLog])],
    providers: [LogService],
    exports: [LogService],
})
export class LogModule {
}
