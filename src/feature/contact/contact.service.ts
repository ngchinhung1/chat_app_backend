import {Injectable, BadRequestException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Contact} from './entities/contact.entity';
import {Repository} from 'typeorm';
import {CreateContactDto} from './dto/create-contact.dto';
import {User} from '../auth/entities/user.entity';
import {ChatService} from '../chat/chat.service';
import {ChatGateway} from "../chat/chat.gateway";

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private readonly contactRepo: Repository<Contact>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly chatService: ChatService,
        private readonly chatGateway: ChatGateway,
    ) {
    }

    async addContact(dto: CreateContactDto, customerId: string) {
        const exists = await this.contactRepo.findOne({
            where: {customer_id: customerId, phone_number: dto.phone_number},
        });

        if (exists) throw new BadRequestException('Contact already exists');

        const contact = this.contactRepo.create({...dto, customer_id: customerId});
        await this.contactRepo.save(contact);

        const matchedUser = await this.userRepo.findOne({
            where: {
                phone_number: dto.phone_number,
                country_code: dto.country_code,
            },
        });

        let chatId: string | null = null;

        if (matchedUser) {
            const result = await this.chatService.createOrJoinChat(customerId, matchedUser.customer_id);
            chatId = result.chatId;

            // ✅ Emit chat_list_update to the current user
            this.chatGateway.getSocketByUserId(customerId)?.emit('chat_list_update', {
                chatId,
                lastMessage: '',
                unreadCount: 0,
                updatedAt: new Date().toISOString(),
            });
        }

        return {
            ...contact,
            chatId,
        };
    }

}