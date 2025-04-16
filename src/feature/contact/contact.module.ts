import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Contact} from './entities/contact.entity';
import {ContactService} from './contact.service';
import {ContactController} from './contact.controller';
import {UserEntity} from '../auth/entities/user.entity';
import {ChatModule} from '../chat/chat.module';
import {I18nService} from "../../i18n/ i18n.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Contact, UserEntity]),
        ChatModule,
    ],
    providers: [ContactService, I18nService],
    controllers: [ContactController],
})
export class ContactModule {
}
