import {Controller, Post, Body, UseGuards, Req} from '@nestjs/common';
import {EngagementIdentifierService} from './engagement_identifier.service';
import {CreateEngagementDto} from './dto/create-engagement.dto';
import {ApiKeyGuard} from "../../config/guards/api-key.guard";
import {Request} from "express";

@Controller('general')
export class EngagementIdentifierController {
    constructor(private readonly engagementService: EngagementIdentifierService) {
    }

    @UseGuards(ApiKeyGuard)
    @Post('engagement-identifiers')
    async createEngagement(@Body() dto: CreateEngagementDto, @Req() req: Request) {
        return this.engagementService.createOrUpdate(dto, req.language);
    }
}
