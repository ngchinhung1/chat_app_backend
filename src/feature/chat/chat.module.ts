import {JwtModule} from '@nestjs/jwt';
import {ConfigModule} from '@nestjs/config';
import {MiddlewareConsumer, Module, NestModule} from "@nestjs/common";
import {ChatGateway} from "./chat.gateway";
import {FcmModule} from "../../fcm/fcm.module";
import {ChatService} from "./chat.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ChatParticipantEntity} from "./entities/chat_participant.entity";
import {MessageEntity} from "./entities/message.entity";
import {ChatListEntity} from "./entities/chat_list.entity";
import {UserEntity} from "../auth/entities/user.entity";
import {socketAuthMiddleware} from "../../middleware/socketAuthMiddleware";

@Module({
    imports: [
        TypeOrmModule.forFeature([ChatParticipantEntity, MessageEntity, ChatListEntity, UserEntity]),
        JwtModule.register({}),
        ConfigModule,
        FcmModule,
    ],
    providers: [ChatGateway, ChatService],
    exports: [ChatGateway],
})
export class ChatModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(socketAuthMiddleware)
            .forRoutes(ChatGateway);
    }
}
