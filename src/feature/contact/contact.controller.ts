import {Controller, Post, Body, UseGuards, Req} from '@nestjs/common';
import {ContactService} from './contact.service';
import {CreateContactDto} from './dto/create-contact.dto';
import {JwtAuthGuard} from "../../config/guards/jwtAuth.guard";

@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) {
    }

    @Post('add')
    @UseGuards(JwtAuthGuard)
    @Post('add')
    async addContact(@Body() dto: CreateContactDto, @Req() req: any) {
        const result = await this.contactService.addContact(req.user, dto);
        return {
            status: true,
            code: 201,
            data: result,
            msg: 'SUCCESS',
            performance_ms: 72, // or calculate dynamically
        };
    }
}