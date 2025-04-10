import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Contact} from './entities/contact.entity';
import {ContactService} from './contact.service';
import {ContactController} from './contact.controller';
import {UserEntity} from '../auth/entities/user.entity';
import {ChatModule} from '../chat/chat.module';
import {ChatService} from "../chat/chat.service";
import {ChatParticipantEntity} from "../chat/entities/chat_participant.entity";
import {MessageEntity} from "../chat/entities/message.entity";
import {ChatListEntity} from "../chat/entities/chat_list.entity";
import {I18nService} from "../../i18n/ i18n.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Contact, UserEntity, ChatParticipantEntity, MessageEntity, ChatListEntity]),
        ChatModule,
    ],
    providers: [ContactService, ChatService, I18nService],
    controllers: [ContactController],
})
export class ContactModule {
}
