"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverseerCommissionSummary = exports.ContributorAccountSummary = exports.AccountSummary = exports.Transaction = exports.TransactionDto = void 0;
class TransactionDto {
}
exports.TransactionDto = TransactionDto;
class Transaction {
}
exports.Transaction = Transaction;
class AccountSummary {
    constructor() {
        this.admins = { total: 0, headAdmin: 0, superAdmin: 0, subAdmin: 0 };
        this.contributors = { total: 0, contributors: 0, investors: 0, superContributors: 0, subContributors: 0 };
        this.commissions = { company: 0, superContributors: 0, subContributors: 0 };
    }
}
exports.AccountSummary = AccountSummary;
class ContributorAccountSummary {
    constructor() {
        this.totalDeposit = 0;
        this.totalWithdrawn = 0;
        this.balance = 0;
    }
}
exports.ContributorAccountSummary = ContributorAccountSummary;
class OverseerCommissionSummary {
    constructor() {
        this.overseer_id = "";
        this.balance = 0;
        this.name = "";
    }
}
exports.OverseerCommissionSummary = OverseerCommissionSummary;
//# sourceMappingURL=transaction-dto.js.map