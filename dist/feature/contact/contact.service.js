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
const chat_service_1 = require("../chat/chat.service");
const user_entity_1 = require("../auth/entities/user.entity");
const contact_entity_1 = require("./entities/contact.entity");
let ContactService = class ContactService {
    constructor(contactRepository, userRepository, // make sure this is added
    chatService) {
        this.contactRepository = contactRepository;
        this.userRepository = userRepository;
        this.chatService = chatService;
    }
    addContact(requester, createContactDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { phone_number, country_code, first_name, last_name } = createContactDto;
            // 1. Check if contact already exists (by phone & country for this user)
            const existing = yield this.contactRepository.findOne({
                where: {
                    ownerId: requester.id,
                    phone_number,
                    country_code,
                },
            });
            let newContact;
            let chat = null;
            // 2. Try to find matched user in the system
            const matchedUser = yield this.userRepository.findOneBy({
                phone_number,
                country_code,
            });
            if (existing) {
                // 3a. Update existing contact info
                existing.first_name = first_name;
                existing.last_name = last_name;
                existing.customer_id = (matchedUser === null || matchedUser === void 0 ? void 0 : matchedUser.customer_id) || existing.customer_id;
                newContact = yield this.contactRepository.save(existing);
                // 4a. If matched user exists, create/join private chat
                if (matchedUser) {
                    chat = yield this.chatService.findOrCreatePrivateChat(requester.customer_id, matchedUser.customer_id);
                }
            }
            else {
                // 3b. Create new contact
                newContact = this.contactRepository.create(Object.assign(Object.assign({}, createContactDto), { ownerId: requester.id, customer_id: matchedUser === null || matchedUser === void 0 ? void 0 : matchedUser.customer_id }));
                // 4b. If matched user exists, create/join private chat
                if (matchedUser) {
                    chat = yield this.chatService.findOrCreatePrivateChat(requester.customer_id, matchedUser.customer_id);
                }
                yield this.contactRepository.save(newContact);
            }
            // 5. Return contact with optional chatId
            return Object.assign(Object.assign({}, newContact), { chatId: (chat === null || chat === void 0 ? void 0 : chat.id) || null });
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
        chat_service_1.ChatService])
], ContactService);
