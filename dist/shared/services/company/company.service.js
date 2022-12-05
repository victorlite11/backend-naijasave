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
exports.CompanyService = void 0;
const common_1 = require("@nestjs/common");
const company_dto_1 = require("../../dto/company/company-dto");
const contributor_dto_1 = require("../../dto/contributor/contributor-dto");
const new_company_data_dto_1 = require("../../dto/new-company-data/new-company-data-dto");
const id_generator_1 = require("../../helpers/id-generator/id-generator");
const shared_interfaces_1 = require("../../interface/shared-interfaces");
const admin_service_1 = require("../admin/admin.service");
const db_mediator_service_1 = require("../db-mediator/db-mediator.service");
let CompanyService = class CompanyService {
    constructor(dbMediatorService, adminService) {
        this.dbMediatorService = dbMediatorService;
        this.adminService = adminService;
    }
    async newCompanyData(new_data) {
        let companyData = await this.dbMediatorService.fetchCompanyData({});
        if (companyData) {
            throw new common_1.HttpException("Company Data already exists", common_1.HttpStatus.BAD_REQUEST);
        }
        let admin = await this.adminService.fetchAdmin(new_data.admin_id);
        if (!new_data.admin_id || !admin || !admin.identity.isHeadAdmin) {
            throw new common_1.HttpException("Only HEAD ADMIN can create company data", common_1.HttpStatus.BAD_REQUEST);
        }
        let company = new company_dto_1.CompanyDto();
        company._id = `${new_data.name.toLowerCase()}` + id_generator_1.IdGenerator.generateKey(30);
        if (new_data.starting_trading_balance) {
            if (isNaN(Number(new_data.starting_trading_balance))) {
                throw new common_1.HttpException("Invalid amount provide", common_1.HttpStatus.BAD_REQUEST);
            }
            company.account.tradingBalance = new_data.starting_trading_balance;
            company.account.availableTradingBalance = new_data.starting_trading_balance;
        }
        company.basicInformation.name = new_data.name;
        company.basicInformation.dateCreated = new Date().toISOString();
        company.credentials.password = id_generator_1.IdGenerator.generateKey(5);
        company.referral.earningPerReferral = 50;
        company.referral.minimumWithdrawable = 500;
        company.settings.contributorAccountMaturityCriteria = {
            amount: {
                use: false, amount: 2000
            },
            days: 18
        };
        company.settings.depositChangeAbleDays = { from: 1, to: 10 };
        company.settings.inactiveTolerance = 10;
        await this.dbMediatorService.insertNewCompanyData(company);
        return { success: true, message: company.credentials.password };
    }
    async getCompanyData(password) {
        return await this.dbMediatorService.fetchCompanyData({
            "credentials.password": password
        });
    }
    async getCompanyDataWithoutPassword() {
        return await this.dbMediatorService.fetchCompanyData({});
    }
    async changeCompanySettings(modified_settings) {
        let comp = await this.getCompanyDataWithoutPassword();
        return await this.dbMediatorService.updateCompanyData({
            _id: comp._id
        }, {
            $set: { settings: modified_settings }
        });
    }
};
CompanyService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [db_mediator_service_1.DbMediatorService,
        admin_service_1.AdminService])
], CompanyService);
exports.CompanyService = CompanyService;
//# sourceMappingURL=company.service.js.map