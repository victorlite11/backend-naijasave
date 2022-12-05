export declare class ContributorDto {
    _id?: string;
    basicInformation?: BasicInformationModel;
    credentials?: CredentialsModel;
    location?: LocationModel;
    account?: AccountModel;
    activities?: ActivitiesModel;
    referral?: ReferralModel;
    privilege?: PrivilegeModel;
    identity?: IdentityModel;
    paymentTicks?: PaymentTicksModel;
    notifications: Notification[];
}
export declare class Notification {
    _id?: string;
    message: string;
    tag: string;
    date: string;
}
export declare class BasicInformationModel {
    name: string;
    age: number;
    gender: "" | "male" | "female";
    dateOfBirth: string;
    nextOfKin: string;
    overseerId: string;
    referralCode?: string;
}
export declare class CredentialsModel {
    phoneNumber: string;
    username: string;
    email: string;
    password: string;
}
export declare class LocationModel {
    country: string;
    state: string;
    localGovernment: string;
    address: string;
}
export declare class AccountModel {
    balance: number;
    hasMadeFirstDeposit: boolean;
    hasPaidOverseer: boolean;
    dailySavings: number;
    minimumDeposit: number;
    commission: CommissionAccount;
    bankDetails?: BankDetails;
}
export declare class CommissionAccount {
    balance: number;
}
export declare class BankDetails {
    name: string;
    accountNumber: string;
    bankName: string;
}
export declare class ActivitiesModel {
    status: "" | "active" | "inactive";
    lastLogin: string;
    regDate: string;
    approvalDate: string;
    actions: Array<ActionModel>;
}
export declare class ActionModel {
    description: string;
    data?: any;
    date: string;
    type?: {
        is: "DailySavings" | "OtherTransaction" | "AccountRegistration" | "AccountApproval" | "AccountRemoval";
        subType?: "Debit" | "Credit";
    };
}
export declare class ReferralModel {
    balance: number;
    code: string;
}
export declare class PrivilegeModel {
    canWithdraw?: boolean;
    canDeposit?: boolean;
    canMakeWithdrawalRequest?: boolean;
    canMakeDepositRequest?: boolean;
    canWithdrawSubordinates?: boolean;
    canDepositSubordinates?: boolean;
    canAcceptSubordinatesRequests?: boolean;
    canRejectSubordinatesRequests?: boolean;
    canWithdrawWhileImmature?: boolean;
    canUseSMS?: boolean;
    canWithdrawSubordinatesWithoutChecks?: boolean;
    canOpenAccountForSubordinates?: boolean;
    canChangeDailyDeposit?: boolean;
    canDepositAnyAmount?: boolean;
}
export declare class IdentityModel {
    isSuperContributor?: boolean;
    isSubContributor?: boolean;
    isContributor?: boolean;
    wasContributor?: boolean;
    isInvestor?: boolean;
    wasInvestor?: boolean;
}
export declare class PaymentTicksModel {
    id: number;
    yearlyTicks: Array<YearlyTicksModel>;
}
export declare class YearlyTicksModel {
    id: number;
    monthlyTicks: Array<MonthlyTicksModel>;
    constructor(id: number, monthlyTicks: Array<MonthlyTicksModel>);
}
export declare class MonthlyTicksModel {
    id: number;
    name: string;
    dailyTicks: Array<DailyTicksModel>;
    constructor(id: number, name: string, dailyTicks: Array<DailyTicksModel>);
}
export declare class DailyTicksModel {
    id: number;
    name: string;
    transaction_id: string;
}
