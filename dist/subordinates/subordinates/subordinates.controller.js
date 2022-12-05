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
exports.SubordinatesController = void 0;
const common_1 = require("@nestjs/common");
const basic_contributor_dto_1 = require("../../modules/shared/dto/basic-contributor/basic-contributor-dto");
const contributor_dto_1 = require("../../modules/shared/dto/contributor/contributor-dto");
const authenticated_guard_1 = require("../../modules/shared/guards/authenticated/authenticated.guard");
const subordinates_fetch_guard_1 = require("../../modules/shared/guards/subordinates-fetch/subordinates-fetch.guard");
const supersub_guard_1 = require("../../modules/shared/guards/super-sub/supersub.guard");
const shared_interfaces_1 = require("../../modules/shared/interface/shared-interfaces");
const entities_mediator_service_1 = require("../../modules/shared/services/entities-mediator/entities-mediator/entities-mediator.service");
const general_service_1 = require("../../modules/shared/services/general/general/general.service");
const subordinates_service_1 = require("../../modules/shared/services/subordinates/subordinates/subordinates.service");
let SubordinatesController = class SubordinatesController {
    constructor(entitiesMediatorService, subordinatesService, generalService) {
        this.entitiesMediatorService = entitiesMediatorService;
        this.subordinatesService = subordinatesService;
        this.generalService = generalService;
    }
    async fetchSubordinates(overseer_id, queries) {
        await this.entitiesMediatorService.fetchEntity(overseer_id);
        if (queries.subordinate_id) {
            return this.generalService.fakePassword(await this.subordinatesService.fetchSubordinateUnder(overseer_id, queries));
        }
        if (queries.count) {
            return await this.countSubordinatesUnder(overseer_id, queries);
        }
        else if (queries.assignable) {
            if (!queries.intended_new_overseer_id) {
                throw new common_1.HttpException("New Overseer ID must be provided", common_1.HttpStatus.EXPECTATION_FAILED);
            }
            return (await this.getAssignableSubordinatesUnder(overseer_id, queries)).map(c => this.generalService.fakePassword(c));
        }
        else {
            return (await this.getSubordinatesUnder(overseer_id, queries)).map(c => this.generalService.fakePassword(c));
        }
    }
    async assignSubordinates(new_overseer_id, subordinates_id_list) {
        return await this.subordinatesService.assignSubordinates(new_overseer_id, subordinates_id_list);
    }
    async countSubordinatesUnder(overseer_id, options) {
        return await this.subordinatesService.countSubordinatesUnder(overseer_id, options);
    }
    async getSubordinatesUnder(overseer_id, options) {
        return await this.subordinatesService.fetchSubordinatesUnder(overseer_id, options);
    }
    async getAssignableSubordinatesUnder(overseer_id, options) {
        return await this.subordinatesService.fetchAssignableSubordinatesUnder(overseer_id, options);
    }
};
__decorate([
    common_1.Get(':overseer_id'),
    common_1.UseGuards(subordinates_fetch_guard_1.SubordinatesFetchGuard),
    __param(0, common_1.Param('overseer_id')), __param(1, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, shared_interfaces_1.IFetchSubordinatesQueries]),
    __metadata("design:returntype", Promise)
], SubordinatesController.prototype, "fetchSubordinates", null);
__decorate([
    common_1.Post('assign_subordinates'),
    __param(0, common_1.Query('new_overseer_id')),
    __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], SubordinatesController.prototype, "assignSubordinates", null);
SubordinatesController = __decorate([
    common_1.Controller('subordinates'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __metadata("design:paramtypes", [entities_mediator_service_1.EntitiesMediatorService,
        subordinates_service_1.SubordinatesService,
        general_service_1.GeneralService])
], SubordinatesController);
exports.SubordinatesController = SubordinatesController;
//# sourceMappingURL=subordinates.controller.js.map