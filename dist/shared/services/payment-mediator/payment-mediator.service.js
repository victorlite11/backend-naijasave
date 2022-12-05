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
exports.PaymentMediatorService = void 0;
const common_1 = require("@nestjs/common");
const commission_service_1 = require("../commission/commission/commission.service");
const contributors_service_1 = require("../contributors/contributors.service");
const entities_mediator_service_1 = require("../entities-mediator/entities-mediator/entities-mediator.service");
const payment_ticks_service_1 = require("../payment-ticks/payment-ticks/payment-ticks.service");
const payment_service_1 = require("../payment/payment.service");
const referral_service_1 = require("../referral/referral/referral.service");
const requests_service_1 = require("../requests/requests.service");
const sms_mediator_service_1 = require("../sms-mediator/sms-mediator/sms-mediator.service");
const transactions_service_1 = require("../transactions/transactions.service");
let PaymentMediatorService = class PaymentMediatorService {
    constructor(entitiesMediatorService, transactionsService, paymentService, paymentTicksService, referralService, requestsService, smsMediatorService, contributorsService, commissionService) {
        this.entitiesMediatorService = entitiesMediatorService;
        this.transactionsService = transactionsService;
        this.paymentService = paymentService;
        this.paymentTicksService = paymentTicksService;
        this.referralService = referralService;
        this.requestsService = requestsService;
        this.smsMediatorService = smsMediatorService;
        this.contributorsService = contributorsService;
        this.commissionService = commissionService;
    }
    async payCommission(op) {
        return this.paymentService.payCommission(op);
    }
    async credit(payload) {
        let trxId = await this.transactionsService.addToOngoingTransactions(payload);
        return await this.paymentService.credit(payload).then(async (paymentComplete) => {
            await this.transactionsService.removeFromOngoingTransactions(trxId);
            if (paymentComplete.status == "success") {
                await this.transactionsService.addToSuccessfulTransactions(payload);
                await this.entitiesMediatorService.updateEntityAccount(paymentComplete.paymentData.from, paymentComplete.paymentData.from.identity);
                await this.entitiesMediatorService.updateEntityAccount(paymentComplete.paymentData.to, paymentComplete.paymentData.to.identity);
                await this.requestsService.deleteDepositRequest(payload._id);
                await this.requestsService.deleteWithdrawalRequest(payload._id);
                if (payload.send_sms_notification) {
                    await this.smsMediatorService.sendTransactionAlert(payload);
                }
                if (payload.purpose == "DailySavings") {
                    let date = new Date(payload.date);
                    await this.paymentTicksService.tick(payload.to, payload._id, {
                        year: date.getFullYear(),
                        month: date.getMonth(),
                        day: date.getDate()
                    });
                    await this.commissionService.chargeFirstPaymentComission({ contributorId: payload.to });
                    await this.commissionService.chargeMonthlyCommission({ contributorId: payload.to });
                    this.referralService.payReferralCommission({ contributorId: payload.to, amount: 50 });
                }
            }
            else {
                await this.transactionsService.addToFailedTransactions(payload);
                throw new common_1.HttpException("Unable to perform transaction", common_1.HttpStatus.BAD_GATEWAY);
            }
            return paymentComplete;
        });
    }
    async debit(payload) {
        let trxId = await this.transactionsService.addToOngoingTransactions(payload);
        if (payload.check) {
            return await this.debitWithChecks(trxId, payload);
        }
        else {
            return await this.debitWithoutChecks(trxId, payload);
        }
    }
    async debitWithoutChecks(trxId, payload) {
        return await this.paymentService.debitWithoutChecks(payload).then(async (paymentComplete) => {
            await this.transactionsService.removeFromOngoingTransactions(trxId);
            if (paymentComplete.status == "success") {
                await this.transactionsService.addToSuccessfulTransactions(payload);
                await this.entitiesMediatorService.updateEntityAccount(paymentComplete.paymentData.from, paymentComplete.paymentData.from.identity);
                await this.entitiesMediatorService.updateEntityAccount(paymentComplete.paymentData.to, paymentComplete.paymentData.to.identity);
                await this.requestsService.deleteDepositRequest(payload._id);
                await this.requestsService.deleteWithdrawalRequest(payload._id);
                if (payload.send_sms_notification) {
                    await this.smsMediatorService.sendTransactionAlert(payload);
                }
            }
            else {
                await this.transactionsService.addToFailedTransactions(payload);
                throw new common_1.HttpException("Unable to perform transaction", common_1.HttpStatus.BAD_GATEWAY);
            }
            return paymentComplete;
        });
    }
    async debitWithChecks(trxId, payload) {
        return await this.paymentService.debitWithChecks(payload).then(async (paymentComplete) => {
            await this.transactionsService.removeFromOngoingTransactions(trxId);
            if (paymentComplete.status == "success") {
                await this.transactionsService.addToSuccessfulTransactions(payload);
                await this.entitiesMediatorService.updateEntityAccount(paymentComplete.paymentData.from, paymentComplete.paymentData.from.identity);
                await this.entitiesMediatorService.updateEntityAccount(paymentComplete.paymentData.to, paymentComplete.paymentData.to.identity);
                await this.requestsService.deleteDepositRequest(payload._id);
                await this.requestsService.deleteWithdrawalRequest(payload._id);
                if (payload.send_sms_notification) {
                    await this.smsMediatorService.sendTransactionAlert(payload);
                }
            }
            else {
                await this.transactionsService.addToFailedTransactions(payload);
                throw new common_1.HttpException("Unable to perform transaction", common_1.HttpStatus.BAD_GATEWAY);
            }
            return paymentComplete;
        });
    }
    async fundAdminAccount(payload) {
        return await this.paymentService.fundAdminAccount(payload);
    }
    async debitAdminAccount(payload) {
        return await this.paymentService.debitAdminAccount(payload);
    }
    async updateTradingBalance(payload) {
        return await this.paymentService.updateTradingBalance(payload);
    }
};
PaymentMediatorService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [entities_mediator_service_1.EntitiesMediatorService,
        transactions_service_1.TransactionsService,
        payment_service_1.PaymentService,
        payment_ticks_service_1.PaymentTicksService,
        referral_service_1.ReferralService,
        requests_service_1.RequestsService,
        sms_mediator_service_1.SmsMediatorService,
        contributors_service_1.ContributorsService,
        commission_service_1.CommissionService])
], PaymentMediatorService);
exports.PaymentMediatorService = PaymentMediatorService;
//# sourceMappingURL=payment-mediator.service.js.map