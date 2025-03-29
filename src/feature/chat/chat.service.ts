import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ChatList} from "./entities/chat_list.entity";
import {ChatParticipant} from "./entities/chat_participant.entity";
import {Message} from "./entities/message.entity";
import {User} from "../auth/entities/user.entity";

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatList)
        private chatListRepo: Repository<ChatList>,
        @InjectRepository(ChatParticipant)
        private chatParticipantRepo: Repository<ChatParticipant>,
        @InjectRepository(Message)
        private messageRepo: Repository<Message>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {
    }

    async getChatListForUser(userCustomerId: string) {
        return this.chatParticipantRepo.find({
            where: {user: {customer_id: userCustomerId}},
            relations: ['chat', 'chat.messages', 'chat.participants'],
        });
    }
}
