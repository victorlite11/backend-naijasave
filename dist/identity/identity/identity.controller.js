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
exports.IdentityController = void 0;
const common_1 = require("@nestjs/common");
const admin_dto_1 = require("../../modules/shared/dto/admin/admin-dto");
const contributor_dto_1 = require("../../modules/shared/dto/contributor/contributor-dto");
const authenticated_guard_1 = require("../../modules/shared/guards/authenticated/authenticated.guard");
const identity_service_1 = require("../../modules/shared/services/identity/identity.service");
let IdentityController = class IdentityController {
    constructor(identityService) {
        this.identityService = identityService;
    }
    async fetchContributorPrivilege(contributor_id) {
        return await this.identityService.fetchContributorIdentity(contributor_id);
    }
    async fetchAdminPrivilege(admin_id) {
        return await this.identityService.fetchAdminIdentity(admin_id);
    }
    async changeContributorPrivilege(contributor_id, interested_identity) {
        return this.identityService.changeContributorIdentity(contributor_id, interested_identity);
    }
    async changeAdminPrivilege(admin_id, interested_identity) {
        return this.identityService.changeAdminIdentity(admin_id, interested_identity);
    }
};
__decorate([
    common_1.Get('contributor_identity'),
    __param(0, common_1.Query('contributor_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IdentityController.prototype, "fetchContributorPrivilege", null);
__decorate([
    common_1.Get('admin_identity'),
    __param(0, common_1.Query('admin_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IdentityController.prototype, "fetchAdminPrivilege", null);
__decorate([
    common_1.Post('change_contributor_identity'),
    __param(0, common_1.Query('contributor_id')),
    __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IdentityController.prototype, "changeContributorPrivilege", null);
__decorate([
    common_1.Post('change_admin_identity'),
    __param(0, common_1.Query('admin_id')),
    __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IdentityController.prototype, "changeAdminPrivilege", null);
IdentityController = __decorate([
    common_1.Controller('identity'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __metadata("design:paramtypes", [identity_service_1.IdentityService])
], IdentityController);
exports.IdentityController = IdentityController;
//# sourceMappingURL=identity.controller.js.map