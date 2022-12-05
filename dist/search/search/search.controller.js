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
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const contributor_dto_1 = require("../../modules/shared/dto/contributor/contributor-dto");
const authenticated_guard_1 = require("../../modules/shared/guards/authenticated/authenticated.guard");
const search_service_1 = require("../../modules/shared/services/search/search/search.service");
const subordinates_service_1 = require("../../modules/shared/services/subordinates/subordinates/subordinates.service");
let SearchController = class SearchController {
    constructor(searchService) {
        this.searchService = searchService;
    }
    async searchContributors(overseer_id, use, search_keywords) {
        if (!overseer_id) {
            throw new common_1.HttpException("No overseer_id provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        return await this.searchService.searchContributors({
            overseer_id: overseer_id,
            use: use,
            search_keywords: search_keywords
        });
    }
    async searchContributorsUnified(overseer_id, search_keywords) {
        return await this.searchService.searchContributorsUnified(overseer_id, search_keywords);
    }
    async searchSubordinates(overseer_id, use, search_keywords) {
        if (!overseer_id) {
            throw new common_1.HttpException("No overseer_id provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        return await this.searchService.searchSubordinates({
            overseer_id: overseer_id,
            use: use,
            search_keywords: search_keywords
        });
    }
    searchTransactions() {
    }
    searchAdmins() {
        9;
    }
};
__decorate([
    common_1.Get('contributors'),
    __param(0, common_1.Query('overseer_id')),
    __param(1, common_1.Query('use')),
    __param(2, common_1.Query('search-keywords')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchContributors", null);
__decorate([
    common_1.Get('contributors_unified_search'),
    __param(0, common_1.Query('overseer_id')),
    __param(1, common_1.Query('search_keywords')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchContributorsUnified", null);
__decorate([
    common_1.Get('subordinates'),
    __param(0, common_1.Query('overseer_id')),
    __param(1, common_1.Query('use')),
    __param(2, common_1.Query('search-keywords')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchSubordinates", null);
__decorate([
    common_1.Get('transactions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "searchTransactions", null);
__decorate([
    common_1.Get('admins'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "searchAdmins", null);
SearchController = __decorate([
    common_1.Controller('search'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __metadata("design:paramtypes", [search_service_1.SearchService])
], SearchController);
exports.SearchController = SearchController;
//# sourceMappingURL=search.controller.js.map