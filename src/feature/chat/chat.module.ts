import {Module} from '@nestjs/common';
import {ChatGateway} from './chat.gateway';
import {ChatService} from './chat.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ChatList} from "./entities/chat_list.entity";
import {ChatParticipant} from "./entities/chat_participant.entity";
import {Message} from "./entities/message.entity";
import {User} from "../auth/entities/user.entity";
import {AuthModule} from "../auth/auth.module";
import {JwtWsAuthGuard} from "../../config/guards/jwtWsAuth.guard";

@Module({
    imports: [
        TypeOrmModule.forFeature([ChatList, ChatParticipant, Message, User]),
        AuthModule,
    ],
    providers: [ChatGateway, ChatService, JwtWsAuthGuard],
})
export class ChatModule {
}
