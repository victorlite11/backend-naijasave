"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminIdentityModel = exports.AdminPrivilegeModel = exports.AdminActionModel = exports.AdminActivitiesModel = exports.AdminBankDetails = exports.CommissionAccount = exports.AdminAccountModel = exports.AdminBasicInformationModel = exports.AdminDto = void 0;
const contributor_dto_1 = require("../contributor/contributor-dto");
class AdminDto {
    constructor() {
        this.basicInformation = new AdminBasicInformationModel();
        this.credentials = new contributor_dto_1.CredentialsModel();
        this.location = new contributor_dto_1.LocationModel();
        this.account = new AdminAccountModel();
        this.activities = new AdminActivitiesModel();
        this.privilege = new AdminPrivilegeModel();
        this.identity = new AdminIdentityModel();
    }
}
exports.AdminDto = AdminDto;
class AdminBasicInformationModel {
    constructor() {
        this.name = "";
        this.age = 22;
        this.gender = "other";
        this.dateOfBirth = "";
        this.overseerId = "";
    }
}
exports.AdminBasicInformationModel = AdminBasicInformationModel;
class AdminAccountModel {
    constructor() {
        this.balance = 0;
        this.dailySavings = 100;
        this.bankDetails = new AdminBankDetails();
    }
}
exports.AdminAccountModel = AdminAccountModel;
class CommissionAccount {
}
exports.CommissionAccount = CommissionAccount;
class AdminBankDetails {
    constructor() {
        this.name = "";
        this.accountNumber = "";
        this.bankName = "";
    }
}
exports.AdminBankDetails = AdminBankDetails;
class AdminActivitiesModel {
    constructor() {
        this.status = "";
        this.lastLogin = "";
        this.actions = [];
    }
}
exports.AdminActivitiesModel = AdminActivitiesModel;
class AdminActionModel {
    constructor() {
        this.description = "";
        this.data = {};
        this.date = "";
    }
}
exports.AdminActionModel = AdminActionModel;
class AdminPrivilegeModel {
    constructor() {
        this.canCreditTradingBalance = false;
        this.canCreditOthers = false;
        this.canDebitOthersWithChecks = false;
        this.canMakeContributorsSuperOrSub = false;
        this.canDebitOthersWithoutChecks = false;
        this.canDebitTradingBalance = false;
        this.canAcceptContributorsRequests = false;
        this.canRejectContributorsRequests = false;
        this.canSeeCompanyProfile = false;
        this.canAcceptSignupRequests = false;
        this.canAcceptDepositRequests = false;
        this.canAcceptWithdrawalRequests = false;
        this.canRemoveContributors = false;
        this.canChangeContributorsOverseer = false;
        this.canSendSMS = false;
        this.canCreateAccountForContributors = false;
        this.canEditSignupRequestData = false;
        this.canWithdrawSelf = false;
        this.canDepositSelf = false;
        this.canPlaceWithdrawalRequest = false;
        this.canPlaceDepositRequest = false;
    }
}
exports.AdminPrivilegeModel = AdminPrivilegeModel;
class AdminIdentityModel {
    constructor() {
        this.isSuperAdmin = false;
        this.isSubAdmin = false;
        this.isHeadAdmin = false;
        this.isFeebleAdmin = false;
        this.wasSuperAdmin = false;
        this.wasSubAdmin = false;
    }
}
exports.AdminIdentityModel = AdminIdentityModel;
//# sourceMappingURL=admin-dto.js.map