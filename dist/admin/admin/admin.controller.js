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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_dto_1 = require("../../modules/shared/dto/admin/admin-dto");
const new_admin_dto_1 = require("../../modules/shared/dto/new-admin/new-admin-dto");
const admin_guard_1 = require("../../modules/shared/guards/admin/admin.guard");
const authenticated_guard_1 = require("../../modules/shared/guards/authenticated/authenticated.guard");
const head_admin_guard_1 = require("../../modules/shared/guards/head-admin/head-admin.guard");
const id_generator_1 = require("../../modules/shared/helpers/id-generator/id-generator");
const shared_interfaces_1 = require("../../modules/shared/interface/shared-interfaces");
const admin_service_1 = require("../../modules/shared/services/admin/admin.service");
const general_service_1 = require("../../modules/shared/services/general/general/general.service");
let AdminController = class AdminController {
    constructor(adminService, generalService) {
        this.adminService = adminService;
        this.generalService = generalService;
    }
    async createNewAdmin(payload) {
        return await this.adminService.createAdmin(payload);
    }
    async fetchSelfData(req) {
        let contributor = await this.adminService.fetchAdmin(req.user.userId);
        return this.generalService.fakePassword(contributor);
    }
    async fetchAdmins() {
        return (await this.adminService.fetchAdmins({})).map(admin => this.generalService.fakePassword(admin));
    }
    async fetchAdmin(id, req) {
        id = (id == undefined || id == "undefined") ? req.user.userId : id;
        let admin = await this.adminService.fetchAdmin(id);
        return this.generalService.fakePassword(admin);
    }
};
__decorate([
    common_1.UseGuards(head_admin_guard_1.HeadAdminGuard),
    common_1.Post('new-admin'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [new_admin_dto_1.NewAdminDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createNewAdmin", null);
__decorate([
    common_1.Get('self'),
    __param(0, common_1.Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "fetchSelfData", null);
__decorate([
    common_1.Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "fetchAdmins", null);
__decorate([
    common_1.Get(":id"),
    __param(0, common_1.Param('id')), __param(1, common_1.Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "fetchAdmin", null);
AdminController = __decorate([
    common_1.Controller('admins'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    common_1.UseGuards(admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        general_service_1.GeneralService])
], AdminController);
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map