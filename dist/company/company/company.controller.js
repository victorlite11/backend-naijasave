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
exports.CompanyController = void 0;
const common_1 = require("@nestjs/common");
const company_dto_1 = require("../../modules/shared/dto/company/company-dto");
const new_company_data_dto_1 = require("../../modules/shared/dto/new-company-data/new-company-data-dto");
const authenticated_guard_1 = require("../../modules/shared/guards/authenticated/authenticated.guard");
const company_guard_1 = require("../../modules/shared/guards/company/company.guard");
const shared_interfaces_1 = require("../../modules/shared/interface/shared-interfaces");
const commission_service_1 = require("../../modules/shared/services/commission/commission/commission.service");
const company_service_1 = require("../../modules/shared/services/company/company.service");
let CompanyController = class CompanyController {
    constructor(companyService, commissionService) {
        this.companyService = companyService;
        this.commissionService = commissionService;
    }
    async getCompanyData(password) {
        return await this.companyService.getCompanyData(password.password);
    }
    async computeCommission() {
        return true;
    }
    async newCompanyData(new_data) {
        return await this.companyService.newCompanyData(new_data);
    }
    async changeCompanySettings(modified_settings) {
        return await this.companyService.changeCompanySettings(modified_settings);
    }
};
__decorate([
    common_1.Post(),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getCompanyData", null);
__decorate([
    common_1.Get('compute-commission'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "computeCommission", null);
__decorate([
    common_1.Post('new_company_data'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [new_company_data_dto_1.NewCompanyDataDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "newCompanyData", null);
__decorate([
    common_1.Put('change_company_settings'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [company_dto_1.CompanySettingsModel]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "changeCompanySettings", null);
CompanyController = __decorate([
    common_1.Controller('company'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    common_1.UseGuards(company_guard_1.CompanyGuard),
    __metadata("design:paramtypes", [company_service_1.CompanyService,
        commission_service_1.CommissionService])
], CompanyController);
exports.CompanyController = CompanyController;
//# sourceMappingURL=company.controller.js.map