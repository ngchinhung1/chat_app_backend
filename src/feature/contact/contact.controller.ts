import {Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus} from '@nestjs/common';
import {ContactService} from './contact.service';
import {CreateContactDto} from './dto/create-contact.dto';
import {JwtAuthGuard} from "../../config/guards/jwtAuth.guard";
import {I18nService} from "../../i18n/ i18n.service";

@Controller('contact')
export class ContactController {
    constructor(
        private readonly contactService: ContactService,
        private readonly i18n: I18nService
    ) {
    }

    @Post('/add')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async addContact(@Body() dto: CreateContactDto, @Req() req: any,): Promise<any> {
        const ownerId = req.user.customer_id;
        const language = (req.headers['language'] as string) || 'en';

        try {
            return await this.contactService.addContact(ownerId, dto, language);
        } catch (error: any) {
            return {
                status: false,
                code: 400,
                msg:
                    (error.response?.msg as string) ||
                    this.i18n.getMessage(language, 'USER_NOT_FOUND_CALL_FOR_DOWNLOAD_APP'),
                data: null,
            };
        }
    }


    @UseGuards(JwtAuthGuard)
    @Post('/match')
    async matchContacts(@Body() body: { contacts: { countryCode: string; phoneNumber: string }[] }) {
        const result = await this.contactService.matchContacts(body.contacts);
        return {
            status: true,
            code: 200,
            data: result,
            msg: 'SUCCESS',
        };
    }

}