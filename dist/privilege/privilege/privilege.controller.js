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
exports.PrivilegeController = void 0;
const common_1 = require("@nestjs/common");
const admin_dto_1 = require("../../modules/shared/dto/admin/admin-dto");
const contributor_dto_1 = require("../../modules/shared/dto/contributor/contributor-dto");
const authenticated_guard_1 = require("../../modules/shared/guards/authenticated/authenticated.guard");
const head_admin_guard_1 = require("../../modules/shared/guards/head-admin/head-admin.guard");
const shared_interfaces_1 = require("../../modules/shared/interface/shared-interfaces");
const privilege_service_1 = require("../../modules/shared/services/privilege/privilege.service");
let PrivilegeController = class PrivilegeController {
    constructor(privilegeService) {
        this.privilegeService = privilegeService;
    }
    async fetchContributorPrivilege(contributor_id) {
        return await this.privilegeService.fetchContributorPrivilege(contributor_id);
    }
    async fetchAdminPrivilege(admin_id) {
        return await this.privilegeService.fetchAdminPrivilege(admin_id);
    }
    async changeContributorPrivilege(contributor_id, modified_privilege) {
        return this.privilegeService.changeContributorPrivilege(contributor_id, modified_privilege);
    }
    async changeAdminPrivilege(admin_id, modified_privilege) {
        return this.privilegeService.changeAdminPrivilege(admin_id, modified_privilege);
    }
};
__decorate([
    common_1.Get('contributor_privilege'),
    __param(0, common_1.Query('contributor_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrivilegeController.prototype, "fetchContributorPrivilege", null);
__decorate([
    common_1.Get('admin_privilege'),
    common_1.UseGuards(head_admin_guard_1.HeadAdminGuard),
    __param(0, common_1.Query('admin_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrivilegeController.prototype, "fetchAdminPrivilege", null);
__decorate([
    common_1.Post('change_contributor_privilege'),
    __param(0, common_1.Query('contributor_id')),
    __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, contributor_dto_1.PrivilegeModel]),
    __metadata("design:returntype", Promise)
], PrivilegeController.prototype, "changeContributorPrivilege", null);
__decorate([
    common_1.Post('change_admin_privilege'),
    common_1.UseGuards(head_admin_guard_1.HeadAdminGuard),
    __param(0, common_1.Query('admin_id')),
    __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.AdminPrivilegeModel]),
    __metadata("design:returntype", Promise)
], PrivilegeController.prototype, "changeAdminPrivilege", null);
PrivilegeController = __decorate([
    common_1.Controller('privilege'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __metadata("design:paramtypes", [privilege_service_1.PrivilegeService])
], PrivilegeController);
exports.PrivilegeController = PrivilegeController;
//# sourceMappingURL=privilege.controller.js.map