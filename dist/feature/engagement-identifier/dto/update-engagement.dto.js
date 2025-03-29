"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEngagementDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_engagement_dto_1 = require("./create-engagement.dto");
class UpdateEngagementDto extends (0, mapped_types_1.PartialType)(create_engagement_dto_1.CreateEngagementDto) {
}
exports.UpdateEngagementDto = UpdateEngagementDto;
