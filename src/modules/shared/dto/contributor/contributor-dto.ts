import { ObjectId } from "mongodb";
import { IdGenerator } from "src/modules/shared/helpers/id-generator/id-generator";

export class ContributorDto {
    _id?: string;
    basicInformation?: BasicInformationModel = new BasicInformationModel();
    credentials?: CredentialsModel = new CredentialsModel();
    location?: LocationModel = new LocationModel();
    account?: AccountModel = new AccountModel();
    activities?: ActivitiesModel = new ActivitiesModel();
    referral?: ReferralModel = new ReferralModel();
    privilege?: PrivilegeModel = new PrivilegeModel();
    identity?: IdentityModel = new IdentityModel();
    paymentTicks?: PaymentTicksModel = new PaymentTicksModel();
    notifications : Notification[] = []
}

export class Notification {
    _id ?: string;
    message : string;
    tag : string;
    date : string;
}
 
export class BasicInformationModel {
    name: string = "";
    age: number = 22;
    gender: "" | "male" | "female" = "";
    dateOfBirth: string = "";
    nextOfKin: string = "";
    overseerId: string = "";
    referralCode?: string = "";
}
 
export class CredentialsModel {
    phoneNumber: string = "";
    username: string = "";
    email: string = "";
    password: string = "";
}

export class LocationModel {
    country: string = "";
    state: string = "";
    localGovernment: string = "";
    address: string = "";
}

export class AccountModel {
    balance: number = 0;
    hasMadeFirstDeposit: boolean = false; // used to determine first payment
    hasPaidOverseer: boolean = false; // used to pay overseers commissions
    dailySavings: number = 100;
    minimumDeposit : number = 3000; // only applies to investors
    commission : CommissionAccount;
    bankDetails?: BankDetails = new BankDetails();
}

export class CommissionAccount {
    balance : number
}

export class BankDetails {
    name: string = "";
    accountNumber: string = "";
    bankName: string = "";
}

export class ActivitiesModel {
    status: "" | "active" | "inactive" = "";
    lastLogin: string = "";
    regDate: string = "";
    approvalDate: string = "";
    actions: Array<ActionModel> = [];
}
 
export class ActionModel {
    description: string = "";
    data?: any = {};
    date: string = "";
    type?: {
        is: "DailySavings" | "OtherTransaction" | "AccountRegistration" | "AccountApproval" | "AccountRemoval";
        subType?: "Debit" | "Credit"
    }
}

export class ReferralModel {
    balance = 0;
    code: string = "";
}

export class PrivilegeModel {
    canWithdraw?: boolean = false;
    canDeposit?: boolean = false;
    canMakeWithdrawalRequest?: boolean = false;
    canMakeDepositRequest?: boolean = false;
    canWithdrawSubordinates?: boolean = false;
    canDepositSubordinates?: boolean = false;
    canAcceptSubordinatesRequests?: boolean = false; // not necessary though since one can turn off ability to credit users
    canRejectSubordinatesRequests?: boolean = false;
    canWithdrawWhileImmature?: boolean = false;
    canUseSMS?: boolean = false;
    canWithdrawSubordinatesWithoutChecks?: boolean = false;
    canOpenAccountForSubordinates?: boolean = false;
    canChangeDailyDeposit?: boolean = false;
    canDepositAnyAmount?: boolean = false;
}

export class IdentityModel {
    isSuperContributor?: boolean = false;
    isSubContributor?: boolean = false;
    isContributor?: boolean = false;
    wasContributor?: boolean = false; // used to change back to original identity from isSuper & isSub
    isInvestor?: boolean = false;
    wasInvestor?: boolean = false; // used to change back to original identity from isSuper & isSub
}

export class PaymentTicksModel {
    id: number = IdGenerator.getRand(9999);
    yearlyTicks: Array<YearlyTicksModel> = [];
}

export class YearlyTicksModel {
    id: number;
    monthlyTicks: Array<MonthlyTicksModel> = [];
    constructor(id: number, monthlyTicks: Array<MonthlyTicksModel>) {
        this.id = id;
        this.monthlyTicks = monthlyTicks;
    }
}

export class MonthlyTicksModel {
    id: number = 0; // month of year (number)
    name: string = ""; // the month name (string)
    dailyTicks: Array<DailyTicksModel> = [];
    constructor(id: number, name: string, dailyTicks: Array<DailyTicksModel>) {
        this.id = id;
        this.name = name;
        this.dailyTicks = dailyTicks;
    }
}

export class DailyTicksModel {
    id: number = 0; // day of the month (number)
    name: string = ""; // day of the month (string)
    transaction_id: string = ""; // the id poiting to the transaction the tick represents  
}
