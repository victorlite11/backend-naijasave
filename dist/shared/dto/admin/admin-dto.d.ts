import { CredentialsModel, LocationModel } from "../contributor/contributor-dto";
export declare class AdminDto {
    _id?: string;
    basicInformation?: AdminBasicInformationModel;
    credentials?: CredentialsModel;
    location?: LocationModel;
    account?: AdminAccountModel;
    activities?: AdminActivitiesModel;
    privilege?: AdminPrivilegeModel;
    identity?: AdminIdentityModel;
}
export declare class AdminBasicInformationModel {
    name: string;
    age: number;
    gender: "other" | "male" | "female";
    dateOfBirth: string;
    overseerId?: string;
}
export declare class AdminAccountModel {
    balance: number;
    commission: CommissionAccount;
    dailySavings?: number;
    bankDetails?: AdminBankDetails;
}
export declare class CommissionAccount {
    balance: number;
}
export declare class AdminBankDetails {
    name: string;
    accountNumber: string;
    bankName: string;
}
export declare class AdminActivitiesModel {
    status: "" | "active" | "inactive";
    lastLogin: string;
    actions: Array<AdminActionModel>;
}
export declare class AdminActionModel {
    description: string;
    data?: any;
    date: string;
}
export declare class AdminPrivilegeModel {
    canCreditTradingBalance?: boolean;
    canCreditOthers?: boolean;
    canDebitOthersWithChecks?: boolean;
    canMakeContributorsSuperOrSub?: boolean;
    canDebitOthersWithoutChecks?: boolean;
    canDebitTradingBalance?: boolean;
    canAcceptContributorsRequests?: boolean;
    canRejectContributorsRequests?: boolean;
    canSeeCompanyProfile?: boolean;
    canAcceptSignupRequests?: boolean;
    canAcceptDepositRequests?: boolean;
    canAcceptWithdrawalRequests?: boolean;
    canRemoveContributors?: boolean;
    canChangeContributorsOverseer?: boolean;
    canSendSMS?: boolean;
    canCreateAccountForContributors?: boolean;
    canEditSignupRequestData?: boolean;
    canWithdrawSelf?: boolean;
    canDepositSelf?: boolean;
    canPlaceWithdrawalRequest?: boolean;
    canPlaceDepositRequest?: boolean;
}
export declare class AdminIdentityModel {
    isSuperAdmin?: boolean;
    isSubAdmin?: boolean;
    isHeadAdmin?: boolean;
    isFeebleAdmin?: boolean;
    wasSuperAdmin?: boolean;
    wasSubAdmin?: boolean;
}
