"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanySettingsModel = exports.CompanyReferralModel = exports.CompanyActivitiesModel = exports.OnlinePaymentAccount = exports.CommissionAccount = exports.CompanyAccountModel = exports.CompanyCredentialsModel = exports.CompanyBasicInformationModel = exports.CompanyDto = void 0;
class CompanyDto {
    constructor() {
        this.basicInformation = new CompanyBasicInformationModel();
        this.credentials = new CompanyCredentialsModel();
        this.account = new CompanyAccountModel();
        this.activities = new CompanyActivitiesModel();
        this.referral = new CompanyReferralModel();
        this.settings = new CompanySettingsModel();
    }
}
exports.CompanyDto = CompanyDto;
class CompanyBasicInformationModel {
    constructor() {
        this.name = "";
        this.dateCreated = "";
    }
}
exports.CompanyBasicInformationModel = CompanyBasicInformationModel;
class CompanyCredentialsModel {
    constructor() {
        this.password = "6sy7ay7sdy7a";
    }
}
exports.CompanyCredentialsModel = CompanyCredentialsModel;
class CompanyAccountModel {
    constructor() {
        this.tradingBalance = 0;
        this.availableTradingBalance = 0;
    }
}
exports.CompanyAccountModel = CompanyAccountModel;
class CommissionAccount {
    constructor() {
        this.balance = 0;
    }
}
exports.CommissionAccount = CommissionAccount;
class OnlinePaymentAccount {
    constructor() {
        this.balance = 0;
    }
}
exports.OnlinePaymentAccount = OnlinePaymentAccount;
class CompanyActivitiesModel {
    constructor() {
        this.actions = [];
    }
}
exports.CompanyActivitiesModel = CompanyActivitiesModel;
class CompanyReferralModel {
    constructor() {
        this.amountPaidOut = 0;
        this.totalReferrals = 0;
        this.minimumWithdrawable = 0;
        this.earningPerReferral = 0;
    }
}
exports.CompanyReferralModel = CompanyReferralModel;
class CompanySettingsModel {
    constructor() {
        this.inactiveTolerance = 10;
        this.depositRequestsSMSNotification = false;
        this.withdrawalRequestsSMSNotification = false;
        this.signupRequestsApprovalSMSNotification = false;
    }
}
exports.CompanySettingsModel = CompanySettingsModel;
//# sourceMappingURL=company-dto.js.map