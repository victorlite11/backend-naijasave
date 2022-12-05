export declare class PaymentDto {
    _id?: string;
    amount: number;
    from: string;
    to: string;
    statement?: string;
    date?: string;
    check?: boolean;
    purpose: "DailySavings" | "OtherTransactions" | "DailySavingsCommission" | "ReferralsCommission";
    send_sms_notification?: boolean;
}
