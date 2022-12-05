"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyTicksModel = exports.MonthlyTicksModel = exports.YearlyTicksModel = exports.PaymentTicksModel = exports.IdentityModel = exports.PrivilegeModel = exports.ReferralModel = exports.ActionModel = exports.ActivitiesModel = exports.BankDetails = exports.CommissionAccount = exports.AccountModel = exports.LocationModel = exports.CredentialsModel = exports.BasicInformationModel = exports.Notification = exports.ContributorDto = void 0;
const id_generator_1 = require("../../helpers/id-generator/id-generator");
class ContributorDto {
    constructor() {
        this.basicInformation = new BasicInformationModel();
        this.credentials = new CredentialsModel();
        this.location = new LocationModel();
        this.account = new AccountModel();
        this.activities = new ActivitiesModel();
        this.referral = new ReferralModel();
        this.privilege = new PrivilegeModel();
        this.identity = new IdentityModel();
        this.paymentTicks = new PaymentTicksModel();
        this.notifications = [];
    }
}
exports.ContributorDto = ContributorDto;
class Notification {
}
exports.Notification = Notification;
class BasicInformationModel {
    constructor() {
        this.name = "";
        this.age = 22;
        this.gender = "";
        this.dateOfBirth = "";
        this.nextOfKin = "";
        this.overseerId = "";
        this.referralCode = "";
    }
}
exports.BasicInformationModel = BasicInformationModel;
class CredentialsModel {
    constructor() {
        this.phoneNumber = "";
        this.username = "";
        this.email = "";
        this.password = "";
    }
}
exports.CredentialsModel = CredentialsModel;
class LocationModel {
    constructor() {
        this.country = "";
        this.state = "";
        this.localGovernment = "";
        this.address = "";
    }
}
exports.LocationModel = LocationModel;
class AccountModel {
    constructor() {
        this.balance = 0;
        this.hasMadeFirstDeposit = false;
        this.hasPaidOverseer = false;
        this.dailySavings = 100;
        this.minimumDeposit = 3000;
        this.bankDetails = new BankDetails();
    }
}
exports.AccountModel = AccountModel;
class CommissionAccount {
}
exports.CommissionAccount = CommissionAccount;
class BankDetails {
    constructor() {
        this.name = "";
        this.accountNumber = "";
        this.bankName = "";
    }
}
exports.BankDetails = BankDetails;
class ActivitiesModel {
    constructor() {
        this.status = "";
        this.lastLogin = "";
        this.regDate = "";
        this.approvalDate = "";
        this.actions = [];
    }
}
exports.ActivitiesModel = ActivitiesModel;
class ActionModel {
    constructor() {
        this.description = "";
        this.data = {};
        this.date = "";
    }
}
exports.ActionModel = ActionModel;
class ReferralModel {
    constructor() {
        this.balance = 0;
        this.code = "";
    }
}
exports.ReferralModel = ReferralModel;
class PrivilegeModel {
    constructor() {
        this.canWithdraw = false;
        this.canDeposit = false;
        this.canMakeWithdrawalRequest = false;
        this.canMakeDepositRequest = false;
        this.canWithdrawSubordinates = false;
        this.canDepositSubordinates = false;
        this.canAcceptSubordinatesRequests = false;
        this.canRejectSubordinatesRequests = false;
        this.canWithdrawWhileImmature = false;
        this.canUseSMS = false;
        this.canWithdrawSubordinatesWithoutChecks = false;
        this.canOpenAccountForSubordinates = false;
        this.canChangeDailyDeposit = false;
        this.canDepositAnyAmount = false;
    }
}
exports.PrivilegeModel = PrivilegeModel;
class IdentityModel {
    constructor() {
        this.isSuperContributor = false;
        this.isSubContributor = false;
        this.isContributor = false;
        this.wasContributor = false;
        this.isInvestor = false;
        this.wasInvestor = false;
    }
}
exports.IdentityModel = IdentityModel;
class PaymentTicksModel {
    constructor() {
        this.id = id_generator_1.IdGenerator.getRand(9999);
        this.yearlyTicks = [];
    }
}
exports.PaymentTicksModel = PaymentTicksModel;
class YearlyTicksModel {
    constructor(id, monthlyTicks) {
        this.monthlyTicks = [];
        this.id = id;
        this.monthlyTicks = monthlyTicks;
    }
}
exports.YearlyTicksModel = YearlyTicksModel;
class MonthlyTicksModel {
    constructor(id, name, dailyTicks) {
        this.id = 0;
        this.name = "";
        this.dailyTicks = [];
        this.id = id;
        this.name = name;
        this.dailyTicks = dailyTicks;
    }
}
exports.MonthlyTicksModel = MonthlyTicksModel;
class DailyTicksModel {
    constructor() {
        this.id = 0;
        this.name = "";
        this.transaction_id = "";
    }
}
exports.DailyTicksModel = DailyTicksModel;
//# sourceMappingURL=contributor-dto.js.map