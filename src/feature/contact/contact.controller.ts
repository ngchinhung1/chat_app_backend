import {Controller, Post, Body, UseGuards, Req} from '@nestjs/common';
import {ContactService} from './contact.service';
import {CreateContactDto} from './dto/create-contact.dto';
import {JwtAuthGuard} from "../../config/guards/jwtAuth.guard";

@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) {
    }

    @Post('/add')
    @UseGuards(JwtAuthGuard)
    async addContact(@Body() dto: CreateContactDto, @Req() req: any) {
        const ownerId = req.user.customer_id;
        const result = await this.contactService.addContact(ownerId, dto);
        return {
            status: true,
            code: 200,
            data: result,
            msg: 'SUCCESS',
        };
    }
}