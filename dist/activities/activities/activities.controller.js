"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivitiesController = void 0;
const common_1 = require("@nestjs/common");
const contributor_dto_1 = require("../../modules/shared/dto/contributor/contributor-dto");
const authenticated_guard_1 = require("../../modules/shared/guards/authenticated/authenticated.guard");
const activities_service_1 = require("../../modules/shared/services/activities/activities.service");
let ActivitiesController = class ActivitiesController {
    constructor(actvitiesService) {
        this.actvitiesService = actvitiesService;
    }
    async fetchPersonalActivitiesLog(contributor_id) {
        return await this.actvitiesService.fetchPersonalActivitiesLog(contributor_id);
    }
};
__decorate([
    common_1.Get('personal_activities_data'),
    __param(0, common_1.Query('contributor_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "fetchPersonalActivitiesLog", null);
ActivitiesController = __decorate([
    common_1.Controller('activities'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __metadata("design:paramtypes", [activities_service_1.ActivitiesService])
], ActivitiesController);
exports.ActivitiesController = ActivitiesController;
//# sourceMappingURL=activities.controller.js.map