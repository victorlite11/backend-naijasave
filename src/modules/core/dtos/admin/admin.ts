import { CredentialsModel, LocationModel } from "../contributor/contributor";

export class AdminDto {
    _id?: string;
    basicInformation?: AdminBasicInformationModel = new AdminBasicInformationModel();
    credentials?: CredentialsModel = new CredentialsModel();
    location?: LocationModel = new LocationModel();
    account?: AdminAccountModel = new AdminAccountModel();
    activities?: AdminActivitiesModel = new AdminActivitiesModel();
    privilege?: AdminPrivilegeModel = new AdminPrivilegeModel();
    identity?: AdminIdentityModel = new AdminIdentityModel();
}
 
export class AdminBasicInformationModel {
    name: string = "";
    age: number = 22;
    gender: "other" | "male" | "female" = "other";
    dateOfBirth: string = "";
    overseerId?: string = "";
}


export class AdminAccountModel {
    balance: number = 0;
    dailySavings?: number = 100; // just to match contributor account interface
    bankDetails?: AdminBankDetails = new AdminBankDetails();
}

export class AdminBankDetails {
    name: string = "";
    accountNumber: string = "";
    bankName: string = "";
}

export class AdminActivitiesModel {
    status: "" | "active" | "inactive" = "";
    lastLogin: string = "";
    actions: Array<AdminActionModel> = [];
}

export class AdminActionModel {
    description: string = "";
    data?: any = {};
    date: string = "";
}

export class AdminPrivilegeModel {
    canCreditTradingBalance?: boolean = false;
    canCreditOthers?: boolean = false;
    canDebitOthersWithChecks?: boolean = false;
    canMakeContributorsSuperOrSub?: boolean = false;
    canDebitOthersWithoutChecks?: boolean = false;
    canDebitTradingBalance?: boolean = false;
    canAcceptContributorsRequests?: boolean = false;
    canRejectContributorsRequests?: boolean = false;
    canSeeCompanyProfile?: boolean = false;
    canAcceptSignupRequests?: boolean = false;
    canAcceptDepositRequests?: boolean = false;
    canAcceptWithdrawalRequests?: boolean = false;
    canRemoveContributors?: boolean = false;
    canChangeContributorsOverseer?: boolean = false;
    canSendSMS?: boolean = false;
    canCreateAccountForContributors?: boolean = false;
    canEditSignupRequestData?: boolean = false;
    canWithdrawSelf?: boolean = false;
    canDepositSelf?: boolean = false;
    canPlaceWithdrawalRequest?: boolean = false;
    canPlaceDepositRequest?: boolean = false;
}
    
export class AdminIdentityModel {
    isSuperAdmin?: boolean = false;
    isSubAdmin?: boolean = false;
    isHeadAdmin?: boolean = false;
    isFeebleAdmin?: boolean = false;
    wasSuperAdmin?: boolean = false; // used to change back to original identity from isSuper & isSub
    wasSubAdmin?: boolean = false; // used to change back to original identity from isSuper & isSub
}
