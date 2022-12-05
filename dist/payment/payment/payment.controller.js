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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const payment_dto_1 = require("../../modules/shared/dto/payment/payment-dto");
const transaction_dto_1 = require("../../modules/shared/dto/transaction/transaction-dto");
const authenticated_guard_1 = require("../../modules/shared/guards/authenticated/authenticated.guard");
const shared_interfaces_1 = require("../../modules/shared/interface/shared-interfaces");
const entities_mediator_service_1 = require("../../modules/shared/services/entities-mediator/entities-mediator/entities-mediator.service");
const payment_mediator_service_1 = require("../../modules/shared/services/payment-mediator/payment-mediator.service");
const payment_service_1 = require("../../modules/shared/services/payment/payment.service");
let PaymentController = class PaymentController {
    constructor(paymentMediatorService, entitiesMediatorService) {
        this.paymentMediatorService = paymentMediatorService;
        this.entitiesMediatorService = entitiesMediatorService;
    }
    async credit(payload) {
        await this.checkRequiredPaymentData(payload);
        return await this.paymentMediatorService.credit(payload).then(paymentComplete => {
            if (paymentComplete.status != "success") {
                throw new common_1.HttpException(paymentComplete.message, common_1.HttpStatus.BAD_GATEWAY);
            }
            else {
                return { success: true, message: paymentComplete.message };
            }
        });
    }
    async debit(payload) {
        await this.checkRequiredPaymentData(payload);
        await this.checkRequiredPaymentDataSpecificToDebits(payload);
        return await this.paymentMediatorService.debit(payload).then(paymentComplete => {
            if (paymentComplete.status != "success") {
                throw new common_1.HttpException(paymentComplete.message, common_1.HttpStatus.BAD_GATEWAY);
            }
            else {
                return { success: true, message: paymentComplete.message };
            }
        });
    }
    async payOverseerCommission(payload) {
        return await this.paymentMediatorService.payCommission(payload);
    }
    async debitTradingBalance(payload) {
        return await this.paymentMediatorService.fundAdminAccount(payload);
    }
    async creditTradingBalance(payload) {
        return await this.paymentMediatorService.debitAdminAccount(payload);
    }
    async updateTradingBalance(payload) {
        return await this.paymentMediatorService.updateTradingBalance(payload);
    }
    async checkRequiredPaymentData(payload) {
        if (!payload.from) {
            throw new common_1.HttpException("no source account id provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        if (!payload.to) {
            throw new common_1.HttpException("no destination account id provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        if (!payload.amount) {
            throw new common_1.HttpException("no amount provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        if (!(await this.entitiesMediatorService.exists(payload.from))) {
            throw new common_1.NotFoundException(`source entity with id ${payload.from} not found`);
        }
        if (!(await this.entitiesMediatorService.exists(payload.to))) {
            throw new common_1.NotFoundException(`destination entity with id ${payload.to} not found`);
        }
    }
    async checkRequiredPaymentDataSpecificToDebits(payload) {
    }
};
__decorate([
    common_1.Post('credit'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_dto_1.PaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "credit", null);
__decorate([
    common_1.Post('debit'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_dto_1.PaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "debit", null);
__decorate([
    common_1.Post('pay-overseer-commission'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_dto_1.OverseerCommissionSummary]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "payOverseerCommission", null);
__decorate([
    common_1.Post('fund-admin'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shared_interfaces_1.TradingBalanceTransactionPayload]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "debitTradingBalance", null);
__decorate([
    common_1.Post('debit-admin'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shared_interfaces_1.TradingBalanceTransactionPayload]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "creditTradingBalance", null);
__decorate([
    common_1.Post('update-trading-balance'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shared_interfaces_1.TradingBalanceTransactionPayload]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "updateTradingBalance", null);
PaymentController = __decorate([
    common_1.Controller('payment'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __metadata("design:paramtypes", [payment_mediator_service_1.PaymentMediatorService,
        entities_mediator_service_1.EntitiesMediatorService])
], PaymentController);
exports.PaymentController = PaymentController;
//# sourceMappingURL=payment.controller.js.map