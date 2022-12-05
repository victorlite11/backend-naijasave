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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const models_core_1 = require("../../../modules/core/misc/models.core/models.core");
const admin_dto_1 = require("../../../modules/shared/dto/admin/admin-dto");
const company_dto_1 = require("../../../modules/shared/dto/company/company-dto");
const contributor_dto_1 = require("../../../modules/shared/dto/contributor/contributor-dto");
const payment_dto_1 = require("../../../modules/shared/dto/payment/payment-dto");
const transaction_dto_1 = require("../../../modules/shared/dto/transaction/transaction-dto");
const shared_interfaces_1 = require("../../../modules/shared/interface/shared-interfaces");
const accounting_service_1 = require("../accounting/accounting.service");
const admin_service_1 = require("../admin/admin.service");
const contributors_service_1 = require("../contributors/contributors.service");
const db_mediator_service_1 = require("../db-mediator/db-mediator.service");
const entities_mediator_service_1 = require("../entities-mediator/entities-mediator/entities-mediator.service");
const qualification_service_1 = require("../qualification/qualification.service");
const transactions_service_1 = require("../transactions/transactions.service");
let PaymentService = class PaymentService {
    constructor(entitiesMediatorService, adminService, dbMediatorService, qualificationService, contributorsService, accountingService, transactionsService) {
        this.entitiesMediatorService = entitiesMediatorService;
        this.adminService = adminService;
        this.dbMediatorService = dbMediatorService;
        this.qualificationService = qualificationService;
        this.contributorsService = contributorsService;
        this.accountingService = accountingService;
        this.transactionsService = transactionsService;
    }
    async payCommission(op) {
        const overseer = await this.dbMediatorService.fetchOne({ _id: op.overseer_id }, { db: "naijasave", collection: "contributors" });
        if (overseer.account.commission.balance < 100) {
            return {
                success: false,
                message: "Balance too low (can only pay commission earnings above N100)"
            };
        }
        if (overseer) {
            await this.dbMediatorService.updateOne({ _id: overseer._id }, { $set: { "account.commission.balance": overseer.account.commission.balance - overseer.account.commission.balance } }, { db: "naijasave", collection: "contributors" });
            const company = await this.dbMediatorService.fetchOne({ "credentials.password": "bbC" }, { db: "naijasave", collection: "company" });
            await this.dbMediatorService.updateOne({ "credentials.password": "bbC" }, { $set: { "account.availableTradingBalance": company.account.availableTradingBalance + overseer.account.commission.balance } }, { db: "naijasave", collection: "company" });
            return {
                success: true,
                message: "Overseer paid successfully"
            };
        }
        else {
            return {
                success: true,
                message: "Overseer unknown"
            };
        }
    }
    async credit(paymentPayload) {
        console.log(paymentPayload);
        let fromEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.from);
        if (fromEntity.identity == shared_interfaces_1.EntityIdentity.CONTRIBUTOR) {
            return await this.creditDestinationAccountFromContributorAccount(paymentPayload, fromEntity.entity);
        }
        else {
            return await this.creditDestinationAccountFromAdminAccount(paymentPayload, fromEntity.entity);
        }
    }
    async creditDestinationAccountFromAdminAccount(paymentPayload, admin) {
        let fromAdmin = admin || await this.adminService.fetchAdmin(paymentPayload.from);
        await this.qualificationService.hasEnoughBalance(paymentPayload.amount, fromAdmin.account);
        await this.qualificationService.canCreditOthers(shared_interfaces_1.EntityIdentity.ADMIN, fromAdmin.privilege);
        let toEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.to);
        if ((toEntity.identity == shared_interfaces_1.EntityIdentity.CONTRIBUTOR)) {
            paymentPayload.purpose = "DailySavings";
            if (toEntity.entity.identity.isContributor) {
            }
            await this.checkIfContributorHasPaidHisDailySavingsForTheDate(paymentPayload);
        }
        let trx = this.accountingService.takeAmoutInFromAccountAndAddInToAccount({
            from: {
                account: fromAdmin.account,
                _id: fromAdmin._id,
                identity: shared_interfaces_1.EntityIdentity.ADMIN
            },
            to: {
                account: toEntity.entity.account,
                _id: toEntity.entity._id,
                identity: toEntity.identity
            },
            amount: paymentPayload.amount
        });
        trx.from.identity = shared_interfaces_1.EntityIdentity.ADMIN;
        trx.to.identity = toEntity.identity;
        return new shared_interfaces_1.IPaymentComplete("success", "Transaction Successful", trx);
    }
    async creditDestinationAccountFromContributorAccount(paymentPayload, contributor) {
        let fromContributor = contributor || await this.contributorsService.fetchContributor(paymentPayload.from);
        await this.qualificationService.hasEnoughBalance(paymentPayload.amount, fromContributor.account);
        await this.qualificationService.canCreditOthers(shared_interfaces_1.EntityIdentity.CONTRIBUTOR, fromContributor.privilege);
        let toEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.to);
        if ((toEntity.identity == shared_interfaces_1.EntityIdentity.CONTRIBUTOR)) {
            paymentPayload.purpose = "DailySavings";
            if (toEntity.entity.identity.isContributor) {
            }
            await this.checkIfContributorHasPaidHisDailySavingsForTheDate(paymentPayload);
        }
        let trx = this.accountingService.takeAmoutInFromAccountAndAddInToAccount({
            from: {
                account: fromContributor.account,
                _id: fromContributor._id,
                identity: shared_interfaces_1.EntityIdentity.CONTRIBUTOR
            },
            to: {
                account: toEntity.entity.account,
                _id: toEntity.entity._id,
                identity: toEntity.identity
            },
            amount: paymentPayload.amount
        });
        trx.from.identity = shared_interfaces_1.EntityIdentity.CONTRIBUTOR;
        trx.to.identity = toEntity.identity;
        return new shared_interfaces_1.IPaymentComplete("success", "Transaction Successful", trx);
    }
    async checkIfContributorHasPaidHisDailySavingsForTheDate(paymentPayload) {
        let contributorTrxs = await this.transactionsService.getSuccessfulTransactions({
            contributor_id: paymentPayload.to,
            type: "DEPOSIT"
        });
        let paymentDate = new Date(paymentPayload.date).toLocaleDateString();
        let didDailyDepositPaymentSameDate = contributorTrxs.filter(trx => {
            return (new Date(trx.date).toLocaleDateString() == paymentDate);
        })[0];
    }
    async debitWithChecks(paymentPayload) {
        let fromEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.from);
        if (fromEntity.identity == shared_interfaces_1.EntityIdentity.CONTRIBUTOR) {
            return await this.debitContributorWithChecks(paymentPayload, fromEntity.entity);
        }
        else {
            return await this.debitAdminWithChecks(paymentPayload, fromEntity.entity);
        }
    }
    async debitContributorWithChecks(paymentPayload, contributor) {
        let fromContributor = contributor || await this.contributorsService.fetchContributor(paymentPayload.from);
        await this.qualificationService.hasEnoughBalance(paymentPayload.amount, fromContributor.account);
        await this.qualificationService.canWithdraw(shared_interfaces_1.EntityIdentity.CONTRIBUTOR, fromContributor.privilege);
        let toEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.to);
        await this.qualificationService.canDebitOthersWithChecks(toEntity.identity, toEntity.entity.privilege);
        let trx = this.accountingService.takeAmoutInFromAccountAndAddInToAccount({
            from: {
                account: fromContributor.account,
                _id: fromContributor._id,
                identity: shared_interfaces_1.EntityIdentity.CONTRIBUTOR
            },
            to: {
                account: toEntity.entity.account,
                _id: toEntity.entity._id,
                identity: toEntity.identity
            },
            amount: paymentPayload.amount
        });
        trx.from.identity = shared_interfaces_1.EntityIdentity.CONTRIBUTOR;
        trx.to.identity = toEntity.identity;
        return new shared_interfaces_1.IPaymentComplete("success", "Transaction Successful", trx);
    }
    async debitAdminWithChecks(paymentPayload, admin) {
        let fromAdmin = admin || await this.adminService.fetchAdmin(paymentPayload.from);
        await this.qualificationService.hasEnoughBalance(paymentPayload.amount, fromAdmin.account);
        await this.qualificationService.canWithdraw(shared_interfaces_1.EntityIdentity.ADMIN, fromAdmin.privilege);
        let toEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.to);
        await this.qualificationService.canDebitOthersWithChecks(toEntity.identity, toEntity.entity.privilege);
        let trx = this.accountingService.takeAmoutInFromAccountAndAddInToAccount({
            from: {
                account: fromAdmin.account,
                _id: fromAdmin._id,
                identity: shared_interfaces_1.EntityIdentity.ADMIN
            },
            to: {
                account: toEntity.entity.account,
                _id: toEntity.entity._id,
                identity: toEntity.identity
            },
            amount: paymentPayload.amount
        });
        trx.from.identity = shared_interfaces_1.EntityIdentity.CONTRIBUTOR;
        trx.to.identity = toEntity.identity;
        return new shared_interfaces_1.IPaymentComplete("success", "Transaction Successful", trx);
    }
    async debitWithoutChecks(paymentPayload) {
        let fromEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.from);
        if (fromEntity.identity == shared_interfaces_1.EntityIdentity.CONTRIBUTOR) {
            return await this.debitContributorWithoutChecks(paymentPayload, fromEntity.entity);
        }
        else {
            return await this.debitAdminWithoutChecks(paymentPayload, fromEntity.entity);
        }
    }
    async debitContributorWithoutChecks(paymentPayload, contributor) {
        let fromContributor = contributor || await this.contributorsService.fetchContributor(paymentPayload.from);
        let toEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.to);
        await this.qualificationService.canDebitOthersWithoutChecks(toEntity.identity, toEntity.entity.privilege);
        let trx = this.accountingService.takeAmoutInFromAccountAndAddInToAccount({
            from: {
                account: fromContributor.account,
                _id: fromContributor._id,
                identity: shared_interfaces_1.EntityIdentity.CONTRIBUTOR
            },
            to: {
                account: toEntity.entity.account,
                _id: toEntity.entity._id,
                identity: toEntity.identity
            },
            amount: paymentPayload.amount
        });
        trx.from.identity = shared_interfaces_1.EntityIdentity.CONTRIBUTOR;
        trx.to.identity = toEntity.identity;
        return new shared_interfaces_1.IPaymentComplete("success", "Transaction Successful", trx);
    }
    async debitAdminWithoutChecks(paymentPayload, admin) {
        let fromAdmin = admin || await this.adminService.fetchAdmin(paymentPayload.from);
        let toEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.to);
        await this.qualificationService.canDebitOthersWithoutChecks(toEntity.identity, toEntity.entity.privilege);
        let trx = this.accountingService.takeAmoutInFromAccountAndAddInToAccount({
            from: {
                account: fromAdmin.account,
                _id: fromAdmin._id,
                identity: shared_interfaces_1.EntityIdentity.ADMIN
            },
            to: {
                account: toEntity.entity.account,
                _id: toEntity.entity._id,
                identity: toEntity.identity
            },
            amount: paymentPayload.amount
        });
        trx.from.identity = shared_interfaces_1.EntityIdentity.ADMIN;
        trx.to.identity = toEntity.identity;
        return new shared_interfaces_1.IPaymentComplete("success", "Transaction Successful", trx);
    }
    async fundAdminAccount(payload) {
        let admin = await this.dbMediatorService.fetchAdmin({
            "credentials.username": payload.admin_username
        });
        if (!admin) {
            throw new common_1.HttpException("No admin with the username provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        let company = await this.dbMediatorService.fetchCompanyData({
            "credentials.password": payload.password
        });
        if (!company) {
            throw new common_1.HttpException("Invalid Company Authorization Password (CAP) provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        if (company.account.availableTradingBalance < payload.amount) {
            throw new common_1.HttpException("Company available balance not enough to fund admin", common_1.HttpStatus.BAD_REQUEST);
        }
        let companyAccount = this.accountingService.debitAvailTradingBalance({
            amount: payload.amount,
            account: company.account
        });
        let adminAccount = this.accountingService.plusBalance({ amount: payload.amount, account: admin.account });
        await this.dbMediatorService.updateCompanyData({
            "credentials.password": payload.password
        }, {
            $set: { account: companyAccount }
        });
        await this.dbMediatorService.updateAdmin({
            _id: admin._id,
        }, {
            $set: {
                "account": adminAccount
            }
        });
        return { success: true, message: "Admin account funded" };
    }
    async debitAdminAccount(payload) {
        let admin = await this.dbMediatorService.fetchAdmin({
            "credentials.username": payload.admin_username
        });
        if (!admin) {
            throw new common_1.HttpException("No admin with the username provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        if (admin.account.balance < payload.amount) {
            throw new common_1.HttpException("Insufficient admin account balance", common_1.HttpStatus.BAD_REQUEST);
        }
        let company = await this.dbMediatorService.fetchCompanyData({
            "credentials.password": payload.password
        });
        if (!company) {
            throw new common_1.HttpException("Invalid Company Authorization Password (CAP) provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        let account = this.accountingService.creditAvailTradingBalance({
            amount: payload.amount,
            account: company.account
        });
        let adminAccount = this.accountingService.minusBalance({ amount: payload.amount, account: admin.account });
        await this.dbMediatorService.updateAdmin({
            _id: admin._id,
        }, {
            $set: {
                "account": adminAccount
            }
        });
        await this.dbMediatorService.updateCompanyData({
            "credentials.password": payload.password
        }, {
            $set: { account: account }
        });
        return { success: true, message: "Admin account debited" };
    }
    async updateTradingBalance(payload) {
        let admin = await this.dbMediatorService.fetchAdmin({
            "credentials.username": payload.admin_username
        });
        if (!admin) {
            throw new common_1.HttpException("No admin with the username provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        let company = await this.dbMediatorService.fetchCompanyData({
            "credentials.password": payload.password
        });
        if (!company) {
            throw new common_1.HttpException("Invalid Company Authorization Password (CAP) provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        if (company.account.tradingBalance > payload.amount) {
            throw new common_1.HttpException("New trading balance must be more than previous trading balance", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        let account = this.accountingService.updateTradingBalance({
            amount: payload.amount,
            account: company.account
        });
        await this.dbMediatorService.updateCompanyData({
            "credentials.password": payload.password
        }, {
            $set: { account: account }
        });
        return { success: true, message: "Trading balance updated" };
    }
};
PaymentService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof entities_mediator_service_1.EntitiesMediatorService !== "undefined" && entities_mediator_service_1.EntitiesMediatorService) === "function" ? _a : Object, typeof (_b = typeof admin_service_1.AdminService !== "undefined" && admin_service_1.AdminService) === "function" ? _b : Object, typeof (_c = typeof db_mediator_service_1.DbMediatorService !== "undefined" && db_mediator_service_1.DbMediatorService) === "function" ? _c : Object, typeof (_d = typeof qualification_service_1.QualificationService !== "undefined" && qualification_service_1.QualificationService) === "function" ? _d : Object, contributors_service_1.ContributorsService, typeof (_e = typeof accounting_service_1.AccountingService !== "undefined" && accounting_service_1.AccountingService) === "function" ? _e : Object, transactions_service_1.TransactionsService])
], PaymentService);
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map