import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CreateContactDto} from './dto/create-contact.dto';
import {UserEntity} from "../auth/entities/user.entity";
import {Contact} from "./entities/contact.entity";
import {ChatListEntity} from "../chat/entities/chat_list.entity";
import {ChatParticipantEntity} from "../chat/entities/chat_participant.entity";

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private readonly contactRepo: Repository<Contact>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(ChatListEntity)
        private readonly chatListRepo: Repository<ChatListEntity>,
        @InjectRepository(ChatParticipantEntity)
        private readonly chatParticipantRepo: Repository<ChatParticipantEntity>,
    ) {
    }

    async addContact(ownerId: string, dto: CreateContactDto) {
        const {country_code, phone_number, first_name, last_name} = dto;

        const user = await this.userRepo.findOne({
            where: {country_code, phone_number},
        });

        if (!user) throw new NotFoundException('User not found.');

        // ✅ Step 1: Reuse existing private chat if exists
        let chat = await this.chatListRepo
            .createQueryBuilder('chat')
            .innerJoin('chat.participants', 'p1', 'p1.customer_id = :ownerId', {ownerId})
            .innerJoin('chat.participants', 'p2', 'p2.customer_id = :contactId', {contactId: user.id})
            .where('chat.chat_type = :type', {type: 'private'})
            .getOne();

        // ✅ Step 2: Create chat if not found
        if (!chat) {
            chat = this.chatListRepo.create({chat_type: 'private'});
            await this.chatListRepo.save(chat);

            const owner = await this.userRepo.findOneBy({id: ownerId});
            if (!owner) throw new NotFoundException('Owner not found');

            const participants = [
                this.chatParticipantRepo.create({
                    chat,
                    user: owner,
                    customer_id: owner.id,
                    role: 'member',
                    joined_at: new Date(),
                }),
                this.chatParticipantRepo.create({
                    chat,
                    user,
                    customer_id: user.id,
                    role: 'member',
                    joined_at: new Date(),
                }),
            ];
            await this.chatParticipantRepo.save(participants);
        }

        // ✅ Step 3: Update or Create contact
        let contact = await this.contactRepo.findOne({
            where: {
                owner: {id: ownerId},
                country_code,
                phone_number,
            },
            relations: ['owner'],
        });

        if (contact) {
            contact.first_name = first_name;
            contact.last_name = last_name;
            contact.customer_id = user.customer_id;
        } else {
            contact = this.contactRepo.create({
                owner: {id: ownerId},
                customer_id: user.customer_id,
                first_name,
                last_name,
                country_code,
                phone_number,
            });
        }

        await this.contactRepo.save(contact);

        return {
            chatId: chat.id,
            first_name,
            last_name,
            country_code,
            phone_number,
            user_id: user.id.toString(),
            customer_id: user.customer_id,
        };
    }
}