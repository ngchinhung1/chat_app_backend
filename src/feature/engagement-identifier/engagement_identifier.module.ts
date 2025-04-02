import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {EngagementIdentifier} from "./entities/engagement_identifiers.entity";
import {EngagementIdentifierService} from "./engagement_identifier.service";
import {EngagementIdentifierController} from "./engagement_identifier.controller";
import {I18nService} from "../../i18n/ i18n.service";

@Module({
    imports: [TypeOrmModule.forFeature([EngagementIdentifier])],
    controllers: [EngagementIdentifierController],
    providers: [EngagementIdentifierService, I18nService],
    exports: [EngagementIdentifierService],
})
export class EngagementIdentifierModule {
}
