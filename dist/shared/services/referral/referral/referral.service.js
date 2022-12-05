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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralService = void 0;
const common_1 = require("@nestjs/common");
const contributor_dto_1 = require("../../../../modules/shared/dto/contributor/contributor-dto");
const basic_contributor_dto_1 = require("../../../../modules/shared/dto/basic-contributor/basic-contributor-dto");
const contributors_service_1 = require("../../contributors/contributors.service");
const db_mediator_service_1 = require("../../db-mediator/db-mediator.service");
const models_core_1 = require("../../../../modules/core/misc/models.core/models.core");
const transactions_service_1 = require("../../transactions/transactions.service");
const company_dto_1 = require("../../../../modules/shared/dto/company/company-dto");
const shared_interfaces_1 = require("../../../../modules/shared/interface/shared-interfaces");
let ReferralService = class ReferralService {
    constructor(contributorsService, transactionsService, dbMediatorService) {
        this.contributorsService = contributorsService;
        this.transactionsService = transactionsService;
        this.dbMediatorService = dbMediatorService;
    }
    async fetchReferred(referralCode) {
        let referred = await this.dbMediatorService.fetchContributors({ "basicInformation.referrer": referralCode });
        let result = [];
        referred.forEach(r => {
            let referred = new basic_contributor_dto_1.BasicContributorDto();
            referred.name = r.basicInformation.name;
            referred.phoneNumber = r.credentials.phoneNumber;
            referred.status = r.activities.status;
            result.push(referred);
        });
        return result;
    }
    async payReferralCommission(op) {
        let trxs = await this.transactionsService.getSuccessfulTransactions({
            contributor_id: op.contributorId,
            type: "DEPOSIT"
        });
        const dailyDepositTrxs = trxs.map(trx => trx.purpose).filter(purpose => purpose == "DailySavings");
        if (dailyDepositTrxs.length == 5) {
            let contributor = await this.dbMediatorService.fetchOne({ _id: op.contributorId }, { collection: "contributors", db: "naijasave" });
            if (contributor.basicInformation.referralCode) {
                let beneficiary = await this.dbMediatorService.fetchOne({ "referral.code": contributor.basicInformation.referralCode }, { collection: "contributors", db: "naijasave" });
                if (beneficiary) {
                    let company = await this.dbMediatorService.fetchOne({ "credentials.password": "bbC" }, { collection: "company", db: "naijasave" });
                    if (company) {
                        this.dbMediatorService.updateOne({}, {
                            $set: { "account.availableTradingBalance": Number(company.account.availableTradingBalance) - op.amount }
                        }, { collection: "company", db: "naijasave" });
                        this.dbMediatorService.updateOne({ _id: beneficiary._id }, {
                            $set: { "referral.balance": Number(beneficiary.referral.balance) + op.amount }
                        }, { collection: "contributors", db: "naijasave" });
                        await this.transactionsService.addToSuccessfulTransactions({
                            amount: op.amount,
                            from: op.contributorId,
                            to: beneficiary._id,
                            date: new Date().toISOString(),
                            send_sms_notification: false,
                            statement: "Referral Commission",
                            purpose: "ReferralsCommission"
                        });
                        return {
                            success: true,
                            message: "Referral Commission paid",
                            data: beneficiary._id
                        };
                    }
                }
            }
        }
    }
    async constructAndReturnReferralData(op) {
        const contributor = await this.dbMediatorService.fetchOne({ _id: op.contributor_id }, { collection: "contributors", db: "naijasave" });
        const referred = await this.dbMediatorService.fetchAll({ "basicInformation.referralCode": contributor.referral.code }, { collection: "contributors", db: "naijasave" });
        return {
            balance: contributor.referral.balance,
            code: contributor.referral.code,
            referred: referred.filter(c => c.basicInformation.referralCode == contributor.referral.code).map(c => {
                return {
                    _id: c._id,
                    name: c.basicInformation.name,
                    phoneNumber: c.credentials.phoneNumber,
                    imageUrl: "",
                    status: c.activities.status
                };
            })
        };
    }
};
ReferralService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [contributors_service_1.ContributorsService,
        transactions_service_1.TransactionsService, typeof (_a = typeof db_mediator_service_1.DbMediatorService !== "undefined" && db_mediator_service_1.DbMediatorService) === "function" ? _a : Object])
], ReferralService);
exports.ReferralService = ReferralService;
//# sourceMappingURL=referral.service.js.map