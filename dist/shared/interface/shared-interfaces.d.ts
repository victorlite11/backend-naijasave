import { AdminAccountModel, AdminDto } from "../dto/admin/admin-dto";
import { BasicContributorDto } from "../dto/basic-contributor/basic-contributor-dto";
import { ChatDto } from "../dto/chat/chat-dto";
import { AccountModel, ActionModel, ContributorDto } from "../dto/contributor/contributor-dto";
export declare class IFetchContributorsQueries {
    identity?: 'super-contributors' | 'sub-contributors' | 'investors' | 'contributors';
    status?: 'active' | 'inactive';
    overseer_id?: string;
    count?: boolean;
}
export declare class ContributorsCountResponse {
    supers: number;
    subs: number;
    investors: number;
    contributors: number;
    total: number;
}
export declare class RequestsCountResponse {
    signups: number;
    deposits: number;
    withdrawals: number;
    total: number;
}
export declare class AnnouncementsCountResponse {
    total: number;
}
export declare class IChatsPayload {
    for: string;
    category: "overseer" | "admin";
    chat?: ChatDto;
}
export declare class ConcernedChatResponse {
    for: string;
    name: string;
    totalUnreadMessages: number;
}
export declare class ConcernedChatsResponse {
    concernedChats?: ConcernedChatResponse[];
    totalUnreadMessages: number;
}
export declare class SMSProforma {
    _id?: string;
    for: "account-change" | "daily-savings" | "credits" | "debits" | "signups" | "deposit-requests" | "withdrawal-requests";
    message: string;
}
export declare class SMSFormat {
    $name?: string;
    $account_type?: string;
    $amount?: number;
    $statement?: string;
    $balance?: number;
    $action?: "debited" | "credited";
    proforma: SMSProforma;
}
export declare const Placeholders: string[];
export declare class IFetchSubordinatesQueries {
    count?: boolean;
    subordinate_id?: string;
    assignable?: boolean;
    intended_new_overseer_id?: string;
    identity?: "investors" | "contributors" | "sub-contributors" | "super-contributors";
}
export declare class IRegisterActionWithoutActionBucket {
    description: string;
    date?: string;
    type?: {
        is: "DailySavings" | "OtherTransactions" | "AccountRegistration" | "AccountRemoval" | "AccountTypeChange" | "Commission";
        subType?: "Debit" | "Credit";
    };
    data?: any;
}
export declare class IRegisterAction extends IRegisterActionWithoutActionBucket {
    actionsBucket: Array<ActionModel>;
}
export declare class IRegisterActionRequest {
    _id: string;
    identity: EntityIdentity;
    newAction: IRegisterActionWithoutActionBucket;
}
export declare class IOpenAccount {
    dailySavings?: number;
    balance?: number;
    account: AccountModel;
}
export declare class IOpenAdminAccount {
    balance?: number;
    account: AdminAccountModel;
}
export declare class ICalcAccount {
    amount: number;
    account: AccountModel | AdminAccountModel;
}
export declare class IPaymentComplete {
    status: "fail" | "success" | "unknown";
    message: string;
    paymentData: ITakeAmoutInFromAccountAndAddInToAccount;
    constructor(status?: "fail" | "success" | "unknown", message?: string, paymentData?: ITakeAmoutInFromAccountAndAddInToAccount);
}
export declare class ISimpleIdGenerationPayload {
    multiplier: number;
}
export declare class ITakeAmoutInFromAccountAndAddInToAccount {
    from: {
        account: AdminAccountModel | AccountModel;
        _id: string;
        identity?: EntityIdentity;
    };
    to: {
        account: AdminAccountModel | AccountModel;
        _id: string;
        identity?: EntityIdentity;
    };
    amount: number;
}
export declare class IFetchEntity {
    entity: AdminDto | ContributorDto;
    identity: EntityIdentity;
}
export declare class IAuthKey {
    _id?: string;
    token: string;
    for: string;
    created: string;
    expires: string;
}
export declare class IAuthResult {
    authenticated: boolean;
    authToken?: string;
    for?: string;
    reason?: string;
}
export declare class OperationFeedback {
    success: boolean;
    message: string;
    data?: any;
}
export declare class ITickOptions {
    day: number;
    month: number;
    year: number;
}
export declare class TradingBalanceTransactionPayload {
    amount: number;
    admin_username: string;
    password: string;
}
export declare enum EntityIdentity {
    ADMIN = 0,
    CONTRIBUTOR = 1
}
export declare class DbLookupData {
    collection: "password-reset-verification-codes" | "signup_requests" | "deposit_requests" | "withdrawal_requests" | "contributors" | "sms-proformas" | "admins" | "chats" | "company" | "announcements" | "ongoing_transactions" | "failed_transactions" | "successful_transactions" | "auth_tokens";
    db?: "naijasave";
    uri?: string;
}
export declare class PasswordResetVerificationCode {
    code: string;
    phoneNumber: string;
    created: string;
    expiresAfter: number;
}
export declare class PasswordResetData {
    phoneNumber: string;
    verificationCode: string;
    newPassword: string;
    requestDate: string;
}
export declare class ReferralData {
    balance: number;
    code: string;
    referred: BasicContributorDto[];
}
