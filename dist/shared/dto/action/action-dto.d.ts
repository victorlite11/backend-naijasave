export declare class ActionDto {
    description: string;
    date?: string;
    type?: {
        is: "DailySavings" | "OtherTransactions" | "AccountRegistration" | "AccountRemoval";
        subType?: "Debit" | "Credit";
    };
    data?: any;
}
