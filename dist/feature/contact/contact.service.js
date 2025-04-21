"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../auth/entities/user.entity");
const contact_entity_1 = require("./entities/contact.entity");
const _i18n_service_1 = require("../../i18n/ i18n.service");
let ContactService = class ContactService {
    constructor(contactRepo, userRepo, i18n) {
        this.contactRepo = contactRepo;
        this.userRepo = userRepo;
        this.i18n = i18n;
    }
    addContact(ownerId, dto, language) {
        return __awaiter(this, void 0, void 0, function* () {
            const { country_code, phone_number, first_name, last_name, customerId } = dto;
            const receiver = yield this.userRepo.findOne({
                where: { country_code, phone_number },
            });
            if (!receiver) {
                throw new common_1.HttpException({
                    status: false,
                    msg: this.i18n.getMessage(language, 'USER_NOT_FOUND_CALL_FOR_DOWNLOAD_APP'),
                    code: 400,
                    data: {},
                }, 400);
            }
            if (receiver.customer_id == customerId) {
                throw new common_1.HttpException({
                    status: false,
                    msg: this.i18n.getMessage(language, 'CANNOT_CHAT_SELF') || 'User cannot chat with itself',
                    code: 400,
                    data: {},
                }, 400);
            }
            let contact = yield this.contactRepo.findOne({
                where: { customer_id: receiver.customer_id },
            });
            if (contact) {
                contact.first_name = first_name;
                contact.last_name = last_name;
            }
            else {
                contact = this.contactRepo.create({
                    customer_id: receiver.customer_id,
                    first_name,
                    last_name,
                    country_code,
                    phone_number,
                });
            }
            yield this.contactRepo.save(contact);
            const owner = yield this.userRepo.findOne({
                where: { customer_id: customerId },
            });
            if (!owner) {
                throw new common_1.HttpException({
                    status: false,
                    msg: this.i18n.getMessage(language, 'USER_NOT_FOUND'),
                    code: 400,
                    data: {},
                }, 400);
            }
            let ownerContact = yield this.contactRepo.findOne({
                where: { customer_id: owner.customer_id },
            });
            if (ownerContact) {
                ownerContact.first_name = owner.first_name;
                ownerContact.last_name = owner.last_name;
            }
            else {
                ownerContact = this.contactRepo.create({
                    customer_id: owner.customer_id,
                    first_name: owner.first_name,
                    last_name: owner.last_name,
                    country_code: owner.country_code,
                    phone_number: owner.phone_number,
                });
            }
            yield this.contactRepo.save(ownerContact);
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
        });
    }
    matchContacts(contacts) {
        return __awaiter(this, void 0, void 0, function* () {
            const formatted = contacts.map(c => `${c.countryCode}${c.phoneNumber}`);
            const found = yield this.contactRepo
                .createQueryBuilder('contact')
                .where(`CONCAT(contact.country_code, contact.phone_number) IN (:...formatted)`, { formatted })
                .getMany();
            return found.map(c => ({
                firstName: c.first_name,
                lastName: c.last_name,
                phoneNumber: c.phone_number,
                countryCode: c.country_code,
                customerId: c.customer_id,
            }));
        });
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contact_entity_1.Contact)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        _i18n_service_1.I18nService])
], ContactService);
