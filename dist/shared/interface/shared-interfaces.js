"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralData = exports.PasswordResetData = exports.PasswordResetVerificationCode = exports.DbLookupData = exports.EntityIdentity = exports.TradingBalanceTransactionPayload = exports.ITickOptions = exports.OperationFeedback = exports.IAuthResult = exports.IAuthKey = exports.IFetchEntity = exports.ITakeAmoutInFromAccountAndAddInToAccount = exports.ISimpleIdGenerationPayload = exports.IPaymentComplete = exports.ICalcAccount = exports.IOpenAdminAccount = exports.IOpenAccount = exports.IRegisterActionRequest = exports.IRegisterAction = exports.IRegisterActionWithoutActionBucket = exports.IFetchSubordinatesQueries = exports.Placeholders = exports.SMSFormat = exports.SMSProforma = exports.ConcernedChatsResponse = exports.ConcernedChatResponse = exports.IChatsPayload = exports.AnnouncementsCountResponse = exports.RequestsCountResponse = exports.ContributorsCountResponse = exports.IFetchContributorsQueries = void 0;
class IFetchContributorsQueries {
}
exports.IFetchContributorsQueries = IFetchContributorsQueries;
class ContributorsCountResponse {
    constructor() {
        this.supers = 0;
        this.subs = 0;
        this.investors = 0;
        this.contributors = 0;
        this.total = 0;
    }
}
exports.ContributorsCountResponse = ContributorsCountResponse;
class RequestsCountResponse {
    constructor() {
        this.signups = 0;
        this.deposits = 0;
        this.withdrawals = 0;
        this.total = 0;
    }
}
exports.RequestsCountResponse = RequestsCountResponse;
class AnnouncementsCountResponse {
    constructor() {
        this.total = 0;
    }
}
exports.AnnouncementsCountResponse = AnnouncementsCountResponse;
class IChatsPayload {
}
exports.IChatsPayload = IChatsPayload;
class ConcernedChatResponse {
    constructor() {
        this.totalUnreadMessages = 0;
    }
}
exports.ConcernedChatResponse = ConcernedChatResponse;
class ConcernedChatsResponse {
    constructor() {
        this.totalUnreadMessages = 0;
    }
}
exports.ConcernedChatsResponse = ConcernedChatsResponse;
class SMSProforma {
}
exports.SMSProforma = SMSProforma;
class SMSFormat {
}
exports.SMSFormat = SMSFormat;
exports.Placeholders = [
    "$name",
    "$account_type",
    "$amount",
    "$statement",
    "$balance",
    "$action"
];
class IFetchSubordinatesQueries {
}
exports.IFetchSubordinatesQueries = IFetchSubordinatesQueries;
class IRegisterActionWithoutActionBucket {
}
exports.IRegisterActionWithoutActionBucket = IRegisterActionWithoutActionBucket;
class IRegisterAction extends IRegisterActionWithoutActionBucket {
}
exports.IRegisterAction = IRegisterAction;
class IRegisterActionRequest {
}
exports.IRegisterActionRequest = IRegisterActionRequest;
class IOpenAccount {
}
exports.IOpenAccount = IOpenAccount;
class IOpenAdminAccount {
}
exports.IOpenAdminAccount = IOpenAdminAccount;
class ICalcAccount {
}
exports.ICalcAccount = ICalcAccount;
class IPaymentComplete {
    constructor(status, message, paymentData) {
        this.message = message;
        this.status = status;
        this.paymentData = paymentData;
    }
}
exports.IPaymentComplete = IPaymentComplete;
class ISimpleIdGenerationPayload {
}
exports.ISimpleIdGenerationPayload = ISimpleIdGenerationPayload;
class ITakeAmoutInFromAccountAndAddInToAccount {
}
exports.ITakeAmoutInFromAccountAndAddInToAccount = ITakeAmoutInFromAccountAndAddInToAccount;
class IFetchEntity {
}
exports.IFetchEntity = IFetchEntity;
class IAuthKey {
}
exports.IAuthKey = IAuthKey;
class IAuthResult {
}
exports.IAuthResult = IAuthResult;
class OperationFeedback {
}
exports.OperationFeedback = OperationFeedback;
class ITickOptions {
}
exports.ITickOptions = ITickOptions;
class TradingBalanceTransactionPayload {
}
exports.TradingBalanceTransactionPayload = TradingBalanceTransactionPayload;
var EntityIdentity;
(function (EntityIdentity) {
    EntityIdentity[EntityIdentity["ADMIN"] = 0] = "ADMIN";
    EntityIdentity[EntityIdentity["CONTRIBUTOR"] = 1] = "CONTRIBUTOR";
})(EntityIdentity = exports.EntityIdentity || (exports.EntityIdentity = {}));
class DbLookupData {
    constructor() {
        this.db = "naijasave";
    }
}
exports.DbLookupData = DbLookupData;
class PasswordResetVerificationCode {
    constructor() {
        this.expiresAfter = 60000 * 2;
    }
}
exports.PasswordResetVerificationCode = PasswordResetVerificationCode;
class PasswordResetData {
}
exports.PasswordResetData = PasswordResetData;
class ReferralData {
}
exports.ReferralData = ReferralData;
//# sourceMappingURL=shared-interfaces.js.map