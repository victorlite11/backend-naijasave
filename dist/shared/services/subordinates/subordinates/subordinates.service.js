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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubordinatesService = void 0;
const common_1 = require("@nestjs/common");
const basic_contributor_dto_1 = require("../../../dto/basic-contributor/basic-contributor-dto");
const contributor_dto_1 = require("../../../dto/contributor/contributor-dto");
const shared_interfaces_1 = require("../../../interface/shared-interfaces");
const contributors_service_1 = require("../../contributors/contributors.service");
const db_mediator_service_1 = require("../../db-mediator/db-mediator.service");
let SubordinatesService = class SubordinatesService {
    constructor(contributorsService, dbMediatorService) {
        this.contributorsService = contributorsService;
        this.dbMediatorService = dbMediatorService;
    }
    async countSubordinatesUnder(overseer_id, options) {
        let contributors = await this.contributorsService.fetchContributors({
            overseer_id: overseer_id,
            identity: options.identity
        });
        return contributors.length;
    }
    async fetchSubordinatesUnder(overseer_id, options) {
        return await this.contributorsService.fetchContributors({
            overseer_id: overseer_id,
            identity: options.identity
        });
    }
    async fetchAssignableSubordinatesUnder(overseer_id, options) {
        let result = [];
        let subordinates = await this.contributorsService.fetchContributors({
            overseer_id: overseer_id,
            identity: options.identity
        });
        let intendedNewOverseer = await this.contributorsService.fetchContributor(options.intended_new_overseer_id);
        if (!intendedNewOverseer) {
            throw new common_1.NotFoundException(`Subordinate with id ${options.intended_new_overseer_id} does not exist`);
        }
        if (intendedNewOverseer.identity.isSuperContributor) {
            subordinates.forEach(s => {
                if (!s.identity.isSuperContributor) {
                    result.push({
                        name: s.basicInformation.name,
                        phoneNumber: s.credentials.phoneNumber,
                        imageUrl: "",
                        _id: s._id,
                        status: s.activities.status
                    });
                }
            });
        }
        if (intendedNewOverseer.identity.isSubContributor) {
            subordinates.forEach(s => {
                if (!s.identity.isSuperContributor && !s.identity.isSubContributor) {
                    result.push({
                        name: s.basicInformation.name,
                        phoneNumber: s.credentials.phoneNumber,
                        imageUrl: "",
                        _id: s._id,
                        status: s.activities.status
                    });
                }
            });
        }
        return result;
    }
    async assignSubordinates(new_overseer_id, subordinates_id_list) {
        let c = await this.contributorsService.fetchContributor(new_overseer_id);
        if (!c) {
            throw new common_1.NotFoundException(`Subordinate with id ${new_overseer_id} does not exist`);
        }
        return await this.dbMediatorService.assignSubordinates(new_overseer_id, subordinates_id_list);
    }
    async fetchSubordinateUnder(overseer_id, options) {
        return await this.contributorsService.fetchContributor(options.subordinate_id);
    }
};
SubordinatesService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [contributors_service_1.ContributorsService,
        db_mediator_service_1.DbMediatorService])
], SubordinatesService);
exports.SubordinatesService = SubordinatesService;
//# sourceMappingURL=subordinates.service.js.map