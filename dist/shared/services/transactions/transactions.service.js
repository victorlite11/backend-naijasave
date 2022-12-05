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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const models_core_1 = require("../../../modules/core/misc/models.core/models.core");
const admin_dto_1 = require("../../../modules/shared/dto/admin/admin-dto");
const company_dto_1 = require("../../../modules/shared/dto/company/company-dto");
const contributor_dto_1 = require("../../../modules/shared/dto/contributor/contributor-dto");
const detailed_payment_data_dto_1 = require("../../../modules/shared/dto/detailed-payment-data/detailed-payment-data-dto");
const payment_dto_1 = require("../../../modules/shared/dto/payment/payment-dto");
const transaction_dto_1 = require("../../../modules/shared/dto/transaction/transaction-dto");
const id_generator_1 = require("../../../modules/shared/helpers/id-generator/id-generator");
const company_service_1 = require("../company/company.service");
const db_mediator_service_1 = require("../db-mediator/db-mediator.service");
const entities_mediator_service_1 = require("../entities-mediator/entities-mediator/entities-mediator.service");
let TransactionsService = class TransactionsService {
    constructor(dbMediatorService, companyService, entitiesMediatorService) {
        this.dbMediatorService = dbMediatorService;
        this.companyService = companyService;
        this.entitiesMediatorService = entitiesMediatorService;
        this.idGenerator = new id_generator_1.IdGenerator();
    }
    async addToOngoingTransactions(paymentPayload) {
        if (!paymentPayload.date) {
            paymentPayload.date = new Date().toISOString();
        }
        if (!paymentPayload._id) {
            paymentPayload._id = this.idGenerator.simpleId({ multiplier: 99999999 });
        }
        await this.dbMediatorService.insertOne(paymentPayload, {
            collection: "ongoing_transactions",
            db: "naijasave"
        });
        return paymentPayload._id;
    }
    async removeFromOngoingTransactions(paymentId) {
        await this.dbMediatorService.deleteOne({
            _id: paymentId
        }, { collection: "ongoing_transactions", db: "naijasave" });
    }
    async addToFailedTransactions(paymentPayload) {
        await this.dbMediatorService.insertOne(paymentPayload, {
            collection: "failed_transactions",
            db: "naijasave"
        });
    }
    async removeFromFailedTransactions(paymentId) {
        await this.dbMediatorService.deleteOne({ _id: paymentId }, { collection: "failed_transactions", db: "naijasave" });
    }
    async removeFromSuccessfulTransactions(paymentId) {
        await this.dbMediatorService.deleteOne({ _id: paymentId }, { collection: "successful_transactions", db: "naijasave" });
    }
    async addToSuccessfulTransactions(paymentPayload) {
        if (!paymentPayload._id) {
            paymentPayload._id = id_generator_1.IdGenerator.generateKey(9);
        }
        await this.dbMediatorService.insertOne(paymentPayload, { collection: "successful_transactions", db: "naijasave" });
    }
    async getSuccessfulTransactions(op) {
        let basicTrxs = [];
        if (op.contributor_id) {
            let query = {};
            if (op.type) {
                query = op.type == "DEPOSIT" ? { to: op.contributor_id } : { from: op.contributor_id };
            }
            else {
                query = { $or: [{ from: op.contributor_id }, { to: op.contributor_id }] };
            }
            let trxs = await this.dbMediatorService.fetchAll(query, { collection: "successful_transactions", db: "naijasave" });
            basicTrxs = trxs.map(trx => {
                return {
                    _id: trx._id,
                    purpose: trx.purpose,
                    amount: trx.amount,
                    statement: trx.statement,
                    date: trx.date,
                };
            });
        }
        else {
            let trxs = await this.dbMediatorService.fetchAll({}, { collection: "successful_transactions", db: "naijasave" });
            basicTrxs = trxs.map(trx => {
                return {
                    _id: trx._id,
                    purpose: trx.purpose,
                    amount: trx.amount,
                    statement: trx.statement,
                    date: trx.date
                };
            });
        }
        return basicTrxs;
    }
    async fetchTransactionDetail(payment_id) {
        let paymentData = await this.dbMediatorService.fetchOne({ _id: payment_id }, { collection: "successful_transactions", db: "naijasave" });
        let detailedTransaction = new detailed_payment_data_dto_1.DetailedPaymentDataDto();
        detailedTransaction.amount = paymentData.amount;
        detailedTransaction.date = paymentData.date;
        detailedTransaction.purpose = paymentData.purpose;
        detailedTransaction.statement = paymentData.statement;
        detailedTransaction.time = paymentData.date;
        let e = await this.entitiesMediatorService.fetchEntity(paymentData.from);
        detailedTransaction.payer = e.entity.basicInformation.name;
        detailedTransaction.payerPhoneNumber = e.entity.credentials.phoneNumber;
        e = await this.entitiesMediatorService.fetchEntity(paymentData.to);
        detailedTransaction.receiver = e.entity.basicInformation.name;
        detailedTransaction.receiverPhoneNumber = e.entity.credentials.phoneNumber;
        return detailedTransaction;
    }
    async calculateAndReturnAccountSummary() {
        let company = await this.dbMediatorService.fetchOne({}, {
            collection: "company", db: "naijasave"
        });
        if (!company) {
            throw new common_1.HttpException("Invalid Company Authorization Password (CAP) provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        const accountSummary = new transaction_dto_1.AccountSummary();
        let contributors = await this.dbMediatorService.fetchAll({}, {
            db: "naijasave", collection: "contributors"
        });
        accountSummary.contributors.total = contributors.map(c => c.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.contributors.contributors = contributors.filter(c => c.identity.isContributor).map(c => c.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.contributors.investors = contributors.filter(c => c.identity.isInvestor).map(c => c.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.contributors.subContributors = contributors.filter(c => c.identity.isSubContributor).map(c => c.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.contributors.superContributors = contributors.filter(c => c.identity.isSuperContributor).map(c => c.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.commissions.superContributors = contributors.filter(c => c.identity.isSuperContributor).map(c => c.account.commission.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.commissions.superContributors = contributors.filter(c => c.identity.isSubContributor).map(c => c.account.commission.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.commissions.company = company.account.commission.balance;
        let admins = await this.dbMediatorService.fetchAll({}, {
            db: "naijasave", collection: "admins"
        });
        accountSummary.admins.total = admins.map(a => a.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.admins.headAdmin = admins.filter(a => a.identity.isHeadAdmin).map(a => a.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.admins.superAdmin = admins.filter(a => a.identity.isSuperAdmin).map(a => a.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.admins.subAdmin = admins.filter(a => a.identity.isSubAdmin).map(a => a.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        return accountSummary;
    }
    async getOverseersCommissionsSummary(op) {
        let overseers = [];
        if (op.for == "super") {
            overseers = await this.dbMediatorService.fetchAll({ "identity.isSuperContributor": true }, { db: "naijasave", collection: "contributors" });
        }
        else {
            overseers = await this.dbMediatorService.fetchAll({ "identity.isSubContributor": true }, { db: "naijasave", collection: "contributors" });
        }
        return overseers.map(overseer => {
            return {
                overseer_id: overseer._id,
                name: overseer.basicInformation.name,
                balance: overseer.account.commission.balance
            };
        });
    }
    async getContributorsAccountSummary(op) {
        const contributor = await this.dbMediatorService.fetchOne({ _id: op.contributorId }, { db: "naijasave", collection: "contributors" });
        const accountSummary = new transaction_dto_1.ContributorAccountSummary();
        if (contributor) {
            let depositTrxs = await this.getSuccessfulTransactions({
                contributor_id: op.contributorId,
                type: "DEPOSIT"
            });
            accountSummary.totalDeposit = depositTrxs.filter(trx => trx.purpose !== "ReferralsCommission").map(trx => trx.amount).reduce((prev, current) => prev + current, 0);
            let withdrawalTrxs = await this.getSuccessfulTransactions({
                contributor_id: op.contributorId,
                type: "WITHDRAWAL"
            });
            accountSummary.totalWithdrawn = withdrawalTrxs.filter(trx => trx.purpose !== "ReferralsCommission" && trx.purpose !== "DailySavingsCommission").map(trx => trx.amount).reduce((prev, current) => prev + current, 0);
            accountSummary.balance = contributor.account.balance;
            return accountSummary;
        }
        else {
            return accountSummary;
        }
    }
};
TransactionsService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof db_mediator_service_1.DbMediatorService !== "undefined" && db_mediator_service_1.DbMediatorService) === "function" ? _a : Object, typeof (_b = typeof company_service_1.CompanyService !== "undefined" && company_service_1.CompanyService) === "function" ? _b : Object, typeof (_c = typeof entities_mediator_service_1.EntitiesMediatorService !== "undefined" && entities_mediator_service_1.EntitiesMediatorService) === "function" ? _c : Object])
], TransactionsService);
exports.TransactionsService = TransactionsService;
//# sourceMappingURL=transactions.service.js.map