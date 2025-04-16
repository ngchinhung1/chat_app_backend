import {HttpException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CreateContactDto} from './dto/create-contact.dto';
import {UserEntity} from "../auth/entities/user.entity";
import {Contact} from "./entities/contact.entity";
import {I18nService} from "../../i18n/ i18n.service";

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private readonly contactRepo: Repository<Contact>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        private readonly i18n: I18nService,
    ) {
    }

    async addContact(ownerId: string, dto: CreateContactDto, language: string) {
        const {country_code, phone_number, first_name, last_name} = dto;

        const user = await this.userRepo.findOne({
            where: {country_code, phone_number},
        });

        if (!user) {
            throw new HttpException(
                {
                    status: false,
                    msg: this.i18n.getMessage(language, 'USER_NOT_FOUND_CALL_FOR_DOWNLOAD_APP'),
                    code: 400,
                    data: {},
                },
                400,
            );
        }

        // ✅ Step 2: Update or Create contact
        let contact = await this.contactRepo.findOne({
            where: {
                country_code,
                phone_number,
            },
        });

        if (contact) {
            contact.first_name = first_name;
            contact.last_name = last_name;
            contact.customer_id = user.customer_id;
        } else {
            contact = this.contactRepo.create({
                customer_id: user.customer_id,
                first_name,
                last_name,
                country_code,
                phone_number,
            });
        }

        await this.contactRepo.save(contact);

        return {
            first_name,
            last_name,
            country_code,
            phone_number,
            customer_id: user.customer_id,
        };
    }

    async matchContacts(contacts: { countryCode: string; phoneNumber: string }[]) {
        const formatted = contacts.map(c => `${c.countryCode}${c.phoneNumber}`);

        const found = await this.contactRepo
            .createQueryBuilder('contact')
            .where(`CONCAT(contact.country_code, contact.phone_number) IN (:...formatted)`, {formatted})
            .getMany();

        return found.map(c => ({
            firstName: c.first_name,
            lastName: c.last_name,
            phoneNumber: c.phone_number,
            countryCode: c.country_code,
            customerId: c.customer_id,
        }));
    }
}