import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEngagementDto } from './dto/create-engagement.dto';
import { UpdateEngagementDto } from './dto/update-engagement.dto';
import {EngagementIdentifier} from "./entities/engagement_identifiers.entity";

@Injectable()
export class EngagementIdentifierService {
    constructor(
        @InjectRepository(EngagementIdentifier)
        private readonly engagementRepo: Repository<EngagementIdentifier>,
    ) {}

    async create(createDto: CreateEngagementDto) {
        const engagement = this.engagementRepo.create(createDto);
        return await this.engagementRepo.save(engagement);
    }

    async findAll() {
        return await this.engagementRepo.find();
    }

    async findOne(id: string) {
        return await this.engagementRepo.findOne({ where: { id } });
    }

    async update(id: string, updateDto: UpdateEngagementDto) {
        await this.engagementRepo.update(id, updateDto);
        return this.findOne(id);
    }

    async remove(id: string) {
        return await this.engagementRepo.delete(id);
    }
}
