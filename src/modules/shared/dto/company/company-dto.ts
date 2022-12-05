import { ActionModel } from "../contributor/contributor-dto";

export class CompanyDto {
    _id?: string;
    basicInformation?: CompanyBasicInformationModel = new CompanyBasicInformationModel();
    credentials?: CompanyCredentialsModel = new CompanyCredentialsModel();
    account?: CompanyAccountModel = new CompanyAccountModel();
    activities?: CompanyActivitiesModel = new CompanyActivitiesModel();
    referral?: CompanyReferralModel = new CompanyReferralModel();
    settings?: CompanySettingsModel = new CompanySettingsModel();
}

export class CompanyBasicInformationModel {
    name: string = "";
    dateCreated?: string = "";
}
 
export class CompanyCredentialsModel {
    password: string = "6sy7ay7sdy7a";
}
export class CompanyAccountModel {
    tradingBalance: number = 0;
    commission : CommissionAccount;
    onlinePayment: OnlinePaymentAccount;
    availableTradingBalance: number = 0;
}

export class CommissionAccount {
    balance : number = 0;
}

export class OnlinePaymentAccount {
    balance : number = 0;
}

export class CompanyActivitiesModel {
    actions: Array<ActionModel> = [];
}

export class CompanyReferralModel {
    amountPaidOut: number = 0;
    totalReferrals: number = 0;
    minimumWithdrawable: number = 0;
    earningPerReferral: number = 0;
}

export class CompanySettingsModel {
    inactiveTolerance: number = 10;
    depositChangeAbleDays: {
      from: number,
      to: number
    };
    contributorAccountMaturityCriteria: {
      days: number;
      amount?: {
        use: boolean;
        amount: number;
      }
    };
    depositRequestsSMSNotification?: boolean = false;
    withdrawalRequestsSMSNotification?: boolean = false;
    signupRequestsApprovalSMSNotification?: boolean = false;
}