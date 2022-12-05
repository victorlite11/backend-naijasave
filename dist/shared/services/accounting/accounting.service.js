"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingService = void 0;
const common_1 = require("@nestjs/common");
const admin_dto_1 = require("../../dto/admin/admin-dto");
const company_dto_1 = require("../../dto/company/company-dto");
const contributor_dto_1 = require("../../dto/contributor/contributor-dto");
const shared_interfaces_1 = require("../../interface/shared-interfaces");
let AccountingService = class AccountingService {
    plusBalance(payload) {
        if (isNaN(Number(payload.amount))) {
            throw new common_1.HttpException(`Invalid amount provided (${payload.amount})`, common_1.HttpStatus.BAD_REQUEST);
        }
        payload.account = this.createUniqueAccountFrom(payload.account);
        payload.account.balance = Number(payload.account.balance) + Number(payload.amount);
        return payload.account;
    }
    minusBalance(payload) {
        if (isNaN(Number(payload.amount))) {
            throw new common_1.HttpException(`Invalid amount provided (${payload.amount})`, common_1.HttpStatus.BAD_REQUEST);
        }
        payload.account = this.createUniqueAccountFrom(payload.account);
        payload.account.balance = Number(payload.account.balance) - Number(payload.amount);
        return payload.account;
    }
    debitAvailTradingBalance(payload) {
        if (isNaN(Number(payload.amount))) {
            throw new common_1.HttpException(`Invalid amount provided (${payload.amount})`, common_1.HttpStatus.BAD_REQUEST);
        }
        if (Number(payload.amount) > Number(payload.account.availableTradingBalance)) {
            throw new common_1.HttpException(`Insufficient Balance`, common_1.HttpStatus.BAD_REQUEST);
        }
        payload.account.availableTradingBalance = Number(payload.account.availableTradingBalance) - Number(payload.amount);
        return payload.account;
    }
    creditAvailTradingBalance(payload) {
        if (isNaN(Number(payload.amount))) {
            throw new common_1.HttpException(`Invalid amount provided (${payload.amount})`, common_1.HttpStatus.BAD_REQUEST);
        }
        payload.account.availableTradingBalance = Number(payload.account.availableTradingBalance) + Number(payload.amount);
        return payload.account;
    }
    updateTradingBalance(payload) {
        if (isNaN(Number(payload.amount))) {
            throw new common_1.HttpException(`Invalid amount provided (${payload.amount})`, common_1.HttpStatus.BAD_REQUEST);
        }
        payload.account.availableTradingBalance = Number(payload.account.availableTradingBalance) + (Number(payload.amount) - Number(payload.account.tradingBalance));
        payload.account.tradingBalance = Number(payload.amount);
        return payload.account;
    }
    takeAmoutInFromAccountAndAddInToAccount(payload) {
        payload.from.account = this.minusBalance({
            account: payload.from.account,
            amount: payload.amount
        });
        payload.to.account = this.plusBalance({
            account: payload.to.account,
            amount: payload.amount
        });
        return payload;
    }
    openAccount(payload) {
        payload.account = this.createUniqueAccountFrom(payload.account);
        if (payload.dailySavings) {
            payload.account.dailySavings = payload.dailySavings;
        }
        else {
            payload.account.dailySavings = 100;
        }
        if (payload.balance) {
            payload.account.balance = payload.balance;
        }
        else {
            payload.account.balance = 0;
        }
        return payload.account;
    }
    openAdminAccount(payload) {
        payload.account = Object.assign({}, payload.account);
        if (payload.balance) {
            payload.account = this.plusBalance({ account: payload.account, amount: payload.balance });
        }
        else {
            payload.account.balance = 0;
        }
        return payload.account;
    }
    createUniqueAccountFrom(account) {
        return Object.assign({}, account);
    }
};
AccountingService = __decorate([
    common_1.Injectable()
], AccountingService);
exports.AccountingService = AccountingService;
//# sourceMappingURL=accounting.service.js.map