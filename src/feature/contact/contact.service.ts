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
        const {country_code, phone_number, first_name, last_name, customerId} = dto;

        const receiver = await this.userRepo.findOne({
            where: {country_code, phone_number},
        });

        if (!receiver) {
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

        if (receiver.customer_id == customerId) {
            throw new HttpException(
                {
                    status: false,
                    msg: this.i18n.getMessage(language, 'CANNOT_CHAT_SELF') || 'User cannot chat with itself',
                    code: 400,
                    data: {},
                },
                400,
            );
        }

        let contact = await this.contactRepo.findOne({
            where: {customer_id: receiver.customer_id},
        });

        if (contact) {
            contact.first_name = first_name;
            contact.last_name = last_name;
        } else {
            contact = this.contactRepo.create({
                customer_id: receiver.customer_id,
                first_name,
                last_name,
                country_code,
                phone_number,
            });
        }
        await this.contactRepo.save(contact);

        const owner = await this.userRepo.findOne({
            where: {customer_id: customerId},
        });

        if (!owner) {
            throw new HttpException(
                {
                    status: false,
                    msg: this.i18n.getMessage(language, 'USER_NOT_FOUND'),
                    code: 400,
                    data: {},
                },
                400
            );
        }

        let ownerContact = await this.contactRepo.findOne({
            where: {customer_id: owner.customer_id},
        });

        if (ownerContact) {
            ownerContact.first_name = owner.first_name;
            ownerContact.last_name = owner.last_name;
        } else {
            ownerContact = this.contactRepo.create({
                customer_id: owner.customer_id,
                first_name: owner.first_name,
                last_name: owner.last_name,
                country_code: owner.country_code,
                phone_number: owner.phone_number,
            });
        }
        await this.contactRepo.save(ownerContact);

        return {
            status: true,
            code: 200,
            data: {
                first_name: first_name,
                last_name: last_name,
                country_code: receiver.country_code,
                phone_number: receiver.phone_number,
                customer_id: receiver.customer_id,
            },
            msg: this.i18n.getMessage(language, 'CREATED_SUCCESSFULLY'),
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