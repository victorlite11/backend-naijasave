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
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const detailed_payment_data_dto_1 = require("../../modules/shared/dto/detailed-payment-data/detailed-payment-data-dto");
const transaction_dto_1 = require("../../modules/shared/dto/transaction/transaction-dto");
const authenticated_guard_1 = require("../../modules/shared/guards/authenticated/authenticated.guard");
const transactions_service_1 = require("../../modules/shared/services/transactions/transactions.service");
let TransactionsController = class TransactionsController {
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async fetchHistory(contributor_id) {
        return await this.transactionsService.getSuccessfulTransactions({
            contributor_id: contributor_id
        });
    }
    async getContributorAccountSummary(contributor_id) {
        return await this.transactionsService.getContributorsAccountSummary({
            contributorId: contributor_id
        });
    }
    async getOverseersCommissionsSummary(target_overseers) {
        return await this.transactionsService.getOverseersCommissionsSummary({
            for: target_overseers
        });
    }
    async fetchAllSuccessfulHistory() {
        return await this.transactionsService.getSuccessfulTransactions({});
    }
    async fetchTransactionDetails(payment_id) {
        return await this.transactionsService.fetchTransactionDetail(payment_id);
    }
    async accountSummary() {
        return await this.transactionsService.calculateAndReturnAccountSummary();
    }
};
__decorate([
    common_1.Get('contributor-history'),
    __param(0, common_1.Query('contributor_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "fetchHistory", null);
__decorate([
    common_1.Get('contributor-account-summary'),
    __param(0, common_1.Query('contributor_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getContributorAccountSummary", null);
__decorate([
    common_1.Get('overseers-commissions-summary'),
    __param(0, common_1.Query('for')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getOverseersCommissionsSummary", null);
__decorate([
    common_1.Get('all-history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "fetchAllSuccessfulHistory", null);
__decorate([
    common_1.Get('transaction-details'),
    __param(0, common_1.Query('payment_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "fetchTransactionDetails", null);
__decorate([
    common_1.Get('account-summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "accountSummary", null);
TransactionsController = __decorate([
    common_1.Controller('transactions'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
exports.TransactionsController = TransactionsController;
//# sourceMappingURL=transactions.controller.js.map