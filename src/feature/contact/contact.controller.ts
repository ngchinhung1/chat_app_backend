import {Controller, Post, Body, UseGuards, Req} from '@nestjs/common';
import {ContactService} from './contact.service';
import {CreateContactDto} from './dto/create-contact.dto';
import {JwtAuthGuard} from "../../config/guards/jwtAuth.guard";
import {BaseResponse} from "../../utils/base-response";

@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) {
    }

    @UseGuards(JwtAuthGuard)
    @Post('add')
    async addContact(@Body() dto: CreateContactDto, @Req() req: any) {
        const customerId = req.user.customer_id;
        const data = await this.contactService.addContact(dto, customerId);
        return new BaseResponse(true, 201, data, 'Contact added successfully');
    }
}