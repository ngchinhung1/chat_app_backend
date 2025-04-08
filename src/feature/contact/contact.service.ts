import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CreateContactDto} from './dto/create-contact.dto';
import {ChatService} from '../chat/chat.service';
import {UserEntity} from "../auth/entities/user.entity";
import {Contact} from "./entities/contact.entity";

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private readonly contactRepository: Repository<Contact>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>, // make sure this is added

        private readonly chatService: ChatService,
    ) {
    }

    async addContact(
        requester: UserEntity,
        createContactDto: CreateContactDto,
    ): Promise<any> {
        const {phone_number, country_code, first_name, last_name} = createContactDto;

        // 1. Check if contact already exists (by phone & country for this user)
        const existing = await this.contactRepository.findOne({
            where: {
                ownerId: requester.id,
                phone_number,
                country_code,
            },
        });

        let newContact: Contact;
        let chat = null;

        // 2. Try to find matched user in the system
        const matchedUser = await this.userRepository.findOneBy({
            phone_number,
            country_code,
        });

        if (existing) {
            // 3a. Update existing contact info
            existing.first_name = first_name;
            existing.last_name = last_name;
            existing.customer_id = matchedUser?.customer_id || existing.customer_id;
            newContact = await this.contactRepository.save(existing);

            // 4a. If matched user exists, create/join private chat
            if (matchedUser) {
                chat = await this.chatService.findOrCreatePrivateChat(
                    requester.customer_id,
                    matchedUser.customer_id,
                );
            }
        } else {
            // 3b. Create new contact
            newContact = this.contactRepository.create({
                ...createContactDto,
                ownerId: requester.id,
                customer_id: matchedUser?.customer_id,
            });

            // 4b. If matched user exists, create/join private chat
            if (matchedUser) {
                chat = await this.chatService.findOrCreatePrivateChat(
                    requester.customer_id,
                    matchedUser.customer_id,
                );
            }

            await this.contactRepository.save(newContact);
        }

        // 5. Return contact with optional chatId
        return {
            ...newContact,
            chatId: chat?.id || null,
        };
    }
}