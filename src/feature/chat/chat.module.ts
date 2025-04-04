import {JwtModule} from '@nestjs/jwt';
import {ConfigModule} from '@nestjs/config';
import {Module} from "@nestjs/common";
import {ChatGateway} from "./chat.gateway";
import {FcmModule} from "../../fcm/fcm.module";
import {ChatService} from "./chat.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ChatParticipantEntity} from "./entities/chat_participant.entity";
import {MessageEntity} from "./entities/message.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([ChatParticipantEntity, MessageEntity]),
        JwtModule.register({}),
        ConfigModule,
        FcmModule,
    ],
    providers: [ChatGateway, ChatService],
})
export class ChatModule {
}
