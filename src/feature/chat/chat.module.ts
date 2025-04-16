import {JwtModule} from '@nestjs/jwt';
import {ConfigModule} from '@nestjs/config';
import {Module} from "@nestjs/common";
import {ChatGateway} from "./chat.gateway";
import {FcmModule} from "../../fcm/fcm.module";
import {ChatService} from "./chat.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {MessageEntity} from "./entities/message.entity";
import {ChatListEntity} from "./entities/chat_list.entity";
import {UserEntity} from "../auth/entities/user.entity";
import {ConversationEntity} from "./entities/conversation.entity";
import {ConversationParticipantsEntity} from "./entities/conversation_participants.entity";
import {Contact} from "../contact/entities/contact.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MessageEntity,
            ChatListEntity,
            UserEntity,
            Contact,
            ConversationEntity,
            ConversationParticipantsEntity]),
        JwtModule.register({}),
        ConfigModule,
        FcmModule,
    ],
    providers: [ChatGateway, ChatService],
    exports: [ChatGateway],
})
export class ChatModule {
}