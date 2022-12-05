import { AdminAccountModel, AdminDto } from "../dto/admin/admin-dto";
import { BasicContributorDto } from "../dto/basic-contributor/basic-contributor-dto";
import { ChatDto } from "../dto/chat/chat-dto";
import { AccountModel, ActionModel, ContributorDto } from "../dto/contributor/contributor-dto";
import { PaymentDto } from "../dto/payment/payment-dto";

export class IFetchContributorsQueries {
    identity?: 'super-contributors' | 'sub-contributors' | 'investors' | 'contributors';
    status?: 'active' | 'inactive';
    overseer_id?: string;
    count?: boolean;
}

export class ContributorsCountResponse {
    supers: number = 0;
    subs: number = 0;
    investors: number = 0;
    contributors: number = 0;
    total: number = 0;
}

export class RequestsCountResponse {
    signups: number = 0;
    deposits: number = 0;
    withdrawals: number = 0;
    total: number = 0;
}

export class AnnouncementsCountResponse {
    total: number = 0;
}

export class IChatsPayload {
    for: string;
    category: "overseer" | "admin";
    chat?: ChatDto
}

export class ConcernedChatResponse {
    for: string;
    name: string;
    totalUnreadMessages: number = 0;
}

export class ConcernedChatsResponse {
    concernedChats?: ConcernedChatResponse[];
    totalUnreadMessages: number = 0;
}

export class SMSProforma {
    _id?: string;
    for: "account-change" | "daily-savings" | "credits" | "debits" | "signups" | "deposit-requests" | "withdrawal-requests" 
    message: string; // $name, $amount, $statement, $balance, $account_type, $action: (debited, credited)
}

export class SMSFormat {
    $name?: string;
    $account_type?: string;
    $amount?: number;
    $statement?: string;
    $balance?: number;
    $action?: "debited" | "credited";
    proforma: SMSProforma;
}

export const Placeholders = [
    "$name",
    "$account_type",
    "$amount",
    "$statement",
    "$balance",
    "$action"
]

export class IFetchSubordinatesQueries {
    count?: boolean; // when only the counts of subordinates is concerned
    subordinate_id?: string;
    assignable?: boolean; // for when an overseer want to assign his subordinates to other contributors
    intended_new_overseer_id?: string; // used to determine the assignale subordinates to return
    identity?: "investors" | "contributors" | "sub-contributors" | "super-contributors";
}
 
export class IRegisterActionWithoutActionBucket {
    description: string;
    date?: string;
    type?: {
        is: "DailySavings" | "OtherTransactions" | "AccountRegistration" | "AccountRemoval" | "AccountTypeChange" | "Commission";
        subType?: "Debit" | "Credit"
    }
    data?: any;
}

export class IRegisterAction extends IRegisterActionWithoutActionBucket {
    actionsBucket: Array<ActionModel>
}

export class IRegisterActionRequest {
    _id: string;
    identity: EntityIdentity;
    newAction: IRegisterActionWithoutActionBucket;
}

export class IOpenAccount {
    dailySavings?: number;
    balance?: number;
    account: AccountModel
}

export class IOpenAdminAccount {
    balance?: number;
    account: AdminAccountModel
}

export class ICalcAccount {
    amount: number;
    account: AccountModel | AdminAccountModel;
}

export class IPaymentComplete {
    status: "fail" | "success" | "unknown";
    message: string;
    paymentData: ITakeAmoutInFromAccountAndAddInToAccount | PaymentDto;
    constructor(
        status?: "fail" | "success" | "unknown", 
        message?: string,
        paymentData?: ITakeAmoutInFromAccountAndAddInToAccount
        ) {
        this.message = message;
        this.status = status;
        this.paymentData = paymentData;
    }
}

export class ISimpleIdGenerationPayload {
    multiplier: number;
}

export class ITakeAmoutInFromAccountAndAddInToAccount {
    from: {
        account: AdminAccountModel | AccountModel;
        _id: string;
        identity?: EntityIdentity
    }
    to: {
        account: AdminAccountModel | AccountModel;
        _id: string;
        identity?: EntityIdentity
    }
    amount: number;
}

export class IFetchEntity {
    entity: AdminDto | ContributorDto;
    identity: EntityIdentity;
}

export class IAuthKey {
    _id ?: string;
    token: string;
    for: string;

    created: string; // date in milli
    expires: string; // date in milli
}

export class IAuthResult {
    authenticated: boolean;
    authToken?: string;
    for?: string;
    reason?: string;
}

export class OperationFeedback {
    success: boolean;
    message: string;
    data?: any;
}

export class ITickOptions {
    day: number;
    month: number;
    year: number;
  }

export class TradingBalanceTransactionPayload {amount: number; admin_username: string; password: string}

export enum EntityIdentity {
    ADMIN, CONTRIBUTOR
}

export class DbLookupData {
    collection : "password-reset-verification-codes" | "signup_requests" | "deposit_requests" | "withdrawal_requests"
                | "contributors" | "sms-proformas" | "admins" | "chats" | "company" | "announcements" | "ongoing_transactions"
                | "failed_transactions" | "successful_transactions" | "auth_tokens";
    db ?: "naijasave" = "naijasave";
    uri ?: string;
}

export class PasswordResetVerificationCode {
    code : string;
    phoneNumber : string;
    created : string;
    expiresAfter : number = 60000 * 2; // in milli-seconds
}

export class PasswordResetData {
    phoneNumber : string;
    verificationCode : string;
    newPassword : string;
    requestDate : string;
}

export class ReferralData {
    balance: number;
    code: string;
    referred: BasicContributorDto[]
}