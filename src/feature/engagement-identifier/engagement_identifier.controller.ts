import {Controller, Get, Post, Body, Param, Delete, Patch, UseGuards} from '@nestjs/common';
import {EngagementIdentifierService} from './engagement_identifier.service';
import {CreateEngagementDto} from './dto/create-engagement.dto';
import {UpdateEngagementDto} from './dto/update-engagement.dto';
import {WsJwtGuard} from "../../config/guards/jwtAuthGuard";

@Controller('engagement-identifiers')
@UseGuards(WsJwtGuard)
export class EngagementIdentifierController {
    constructor(private readonly engagementService: EngagementIdentifierService) {
    }

    @Post()
    create(@Body() createDto: CreateEngagementDto) {
        return this.engagementService.create(createDto);
    }

    @Get()
    findAll() {
        return this.engagementService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.engagementService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateEngagementDto) {
        return this.engagementService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.engagementService.remove(id);
    }
}
