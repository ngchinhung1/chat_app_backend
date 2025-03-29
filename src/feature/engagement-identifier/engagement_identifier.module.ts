import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {EngagementIdentifier} from "./entities/engagement_identifiers.entity";
import {EngagementIdentifierService} from "./engagement_identifier.service";
import {EngagementIdentifierController} from "./engagement_identifier.controller";

@Module({
    imports: [TypeOrmModule.forFeature([EngagementIdentifier])],
    controllers: [EngagementIdentifierController],
    providers: [EngagementIdentifierService],
    exports: [EngagementIdentifierService],
})
export class EngagementIdentifierModule {
}
