export declare class TransactionDto {
    statement: string;
    amount: number;
    purpose: "DailySavings" | "OtherTransactions" | "DailySavingsCommission" | "ReferralsCommission";
    _id?: string;
    date: string;
}
export declare class Transaction {
    _id: string;
    date: string;
    statement: string;
    amount: number;
    purpose: "DailySavings" | "OtherTransactions" | "DailySavingsCommission" | "ReferralsCommission";
    type: 'DEPOSIT' | 'WITHDRAW';
    partiesID: {
        source: string;
        destination: string;
    };
}
export declare class AccountSummary {
    admins: {
        total: number;
        headAdmin: number;
        superAdmin: number;
        subAdmin: number;
    };
    contributors: {
        total: number;
        contributors: number;
        investors: number;
        superContributors: number;
        subContributors: number;
    };
    commissions: {
        company: number;
        superContributors: number;
        subContributors: number;
    };
}
export declare class ContributorAccountSummary {
    totalDeposit: number;
    totalWithdrawn: number;
    balance: number;
}
export declare class OverseerCommissionSummary {
    overseer_id: string;
    balance: number;
    name: string;
}
