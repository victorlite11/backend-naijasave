export class TransactionDto {
    statement: string;
    amount: number;
    purpose: "DailySavings" | "OtherTransactions" | "DailySavingsCommission" | "ReferralsCommission";
    method: "ONLINE" | "CASH";
    _id?: string;
    date: string;
}

export class Transaction {
    _id : string;
    date : string;
    statement : string;
    amount : number;
    purpose: "DailySavings" | "OtherTransactions" | "DailySavingsCommission" | "ReferralsCommission";
    type : 'DEPOSIT' | 'WITHDRAW';
    method: "ONLINE" | "CASH";
    partiesID : {
        source : string;
        destination : string;
    }
}

export class AccountSummary {
    admins : {
        total: number;
        headAdmin: number;
        superAdmin: number;
        subAdmin: number;
    } = {total : 0, headAdmin : 0, superAdmin: 0, subAdmin: 0}
    contributors : {
        total: number;
        contributors: number;
        investors: number;
        superContributors: number;
        subContributors: number;
    } = {total: 0, contributors: 0, investors: 0, superContributors: 0, subContributors: 0}
    commissions : {
        company : number;
        superContributors : number;
        subContributors : number;
    } = {company : 0, superContributors : 0, subContributors: 0}
}

export class ContributorAccountSummary {
    totalDeposit: number = 0;
    totalWithdrawn: number = 0;
    balance: number = 0;
}

export class OverseerCommissionSummary {
    overseer_id: string = "";
    balance: number = 0;
    name: string = ""
}
