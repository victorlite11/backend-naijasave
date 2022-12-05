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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const contributor_dto_1 = require("../../../dto/contributor/contributor-dto");
const shared_interfaces_1 = require("../../../interface/shared-interfaces");
const contributors_service_1 = require("../../contributors/contributors.service");
const db_mediator_service_1 = require("../../db-mediator/db-mediator.service");
const entities_mediator_service_1 = require("../../entities-mediator/entities-mediator/entities-mediator.service");
const subordinates_service_1 = require("../../subordinates/subordinates/subordinates.service");
let SearchService = class SearchService {
    constructor(subordinatesService, contributorsService, dbMediatorService, entitiesMediatorService) {
        this.subordinatesService = subordinatesService;
        this.contributorsService = contributorsService;
        this.dbMediatorService = dbMediatorService;
        this.entitiesMediatorService = entitiesMediatorService;
    }
    async searchContributorsUnified(overseer_id, search_keywords) {
        let entity = await this.entitiesMediatorService.fetchEntity(overseer_id);
        let contributors;
        if (entity.identity == shared_interfaces_1.EntityIdentity.ADMIN) {
            contributors = await this.contributorsService.fetchContributors({});
        }
        else {
            contributors = await this.dbMediatorService.fetchContributors({ "basicInformation.overseerId": overseer_id });
        }
        let result = [];
        result = contributors.filter(c => c.basicInformation.name.includes(search_keywords) ||
            c.credentials.phoneNumber.includes(search_keywords) ||
            c.location.address.includes(search_keywords) ||
            c._id.includes(search_keywords));
        return result;
    }
    async searchContributors(option) {
        let contributors = await this.contributorsService.fetchContributors({});
        let result = [];
        contributors.forEach(subordinate => {
            var _a;
            switch (option.use) {
                case "name":
                    if ((_a = subordinate.basicInformation) === null || _a === void 0 ? void 0 : _a.name.toLowerCase().includes(option.search_keywords.toLowerCase())) {
                        result.push(subordinate);
                    }
                    break;
                case "phone":
                    if (subordinate.credentials.phoneNumber.includes(option.search_keywords)) {
                        result.push(subordinate);
                    }
                    break;
                case "email":
                    if (subordinate.credentials.email.includes(option.search_keywords)) {
                        result.push(subordinate);
                    }
                    break;
                case "location":
                    if (subordinate.location.address.includes(option.search_keywords)) {
                        result.push(subordinate);
                    }
                    break;
                default:
                    break;
            }
        });
        return result;
    }
    async searchSubordinates(option) {
        let subordinates = await this.subordinatesService.fetchSubordinatesUnder(option.overseer_id, { identity: undefined });
        let result = [];
        subordinates.forEach(subordinate => {
            var _a;
            switch (option.use) {
                case "name":
                    if ((_a = subordinate.basicInformation) === null || _a === void 0 ? void 0 : _a.name.toLowerCase().includes(option.search_keywords.toLowerCase())) {
                        result.push(subordinate);
                    }
                    break;
                case "phone":
                    if (subordinate.credentials.phoneNumber.includes(option.search_keywords)) {
                        result.push(subordinate);
                    }
                    break;
                case "email":
                    if (subordinate.credentials.email.includes(option.search_keywords)) {
                        result.push(subordinate);
                    }
                    break;
                case "location":
                    if (subordinate.location.address.includes(option.search_keywords)) {
                        result.push(subordinate);
                    }
                    break;
                default:
                    break;
            }
        });
        return result;
    }
};
SearchService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [subordinates_service_1.SubordinatesService,
        contributors_service_1.ContributorsService,
        db_mediator_service_1.DbMediatorService,
        entities_mediator_service_1.EntitiesMediatorService])
], SearchService);
exports.SearchService = SearchService;
//# sourceMappingURL=search.service.js.map