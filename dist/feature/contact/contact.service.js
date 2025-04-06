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
const contact_entity_1 = require("./entities/contact.entity");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../auth/entities/user.entity");
const chat_service_1 = require("../chat/chat.service");
const chat_gateway_1 = require("../chat/chat.gateway");
let ContactService = class ContactService {
    constructor(contactRepo, userRepo, chatService, chatGateway) {
        this.contactRepo = contactRepo;
        this.userRepo = userRepo;
        this.chatService = chatService;
        this.chatGateway = chatGateway;
    }
    addContact(dto, customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const exists = yield this.contactRepo.findOne({
                where: { customer_id: customerId, phone_number: dto.phone_number },
            });
            if (exists)
                throw new common_1.BadRequestException('Contact already exists');
            const contact = this.contactRepo.create(Object.assign(Object.assign({}, dto), { customer_id: customerId }));
            yield this.contactRepo.save(contact);
            const matchedUser = yield this.userRepo.findOne({
                where: {
                    phone_number: dto.phone_number,
                    country_code: dto.country_code,
                },
            });
            let chatId = null;
            if (matchedUser) {
                const result = yield this.chatService.createOrJoinChat(customerId, matchedUser.customer_id);
                chatId = result.chatId;
                // ✅ Emit chat_list_update to the current user
                (_a = this.chatGateway.getSocketByUserId(customerId)) === null || _a === void 0 ? void 0 : _a.emit('chat_list_update', {
                    chatId,
                    lastMessage: '',
                    unreadCount: 0,
                    updatedAt: new Date().toISOString(),
                });
            }
            return Object.assign(Object.assign({}, contact), { chatId });
        });
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contact_entity_1.Contact)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        chat_service_1.ChatService,
        chat_gateway_1.ChatGateway])
], ContactService);
