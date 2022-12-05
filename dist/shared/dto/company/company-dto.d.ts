import { ActionModel } from "../contributor/contributor-dto";
export declare class CompanyDto {
    _id?: string;
    basicInformation?: CompanyBasicInformationModel;
    credentials?: CompanyCredentialsModel;
    account?: CompanyAccountModel;
    activities?: CompanyActivitiesModel;
    referral?: CompanyReferralModel;
    settings?: CompanySettingsModel;
}
export declare class CompanyBasicInformationModel {
    name: string;
    dateCreated?: string;
}
export declare class CompanyCredentialsModel {
    password: string;
}
export declare class CompanyAccountModel {
    tradingBalance: number;
    commission: CommissionAccount;
    onlinePayment: OnlinePaymentAccount;
    availableTradingBalance: number;
}
export declare class CommissionAccount {
    balance: number;
}
export declare class OnlinePaymentAccount {
    balance: number;
}
export declare class CompanyActivitiesModel {
    actions: Array<ActionModel>;
}
export declare class CompanyReferralModel {
    amountPaidOut: number;
    totalReferrals: number;
    minimumWithdrawable: number;
    earningPerReferral: number;
}
export declare class CompanySettingsModel {
    inactiveTolerance: number;
    depositChangeAbleDays: {
        from: number;
        to: number;
    };
    contributorAccountMaturityCriteria: {
        days: number;
        amount?: {
            use: boolean;
            amount: number;
        };
    };
    depositRequestsSMSNotification?: boolean;
    withdrawalRequestsSMSNotification?: boolean;
    signupRequestsApprovalSMSNotification?: boolean;
}
