import { ObjectId } from "mongodb";

export class PaymentDto {
    _id?: string;
    amount: number;
    from: string;
    to: string;
    statement?: string;
    date?: string;
    check?: boolean;
    method: "ONLINE" | "CASH";
    purpose: "DailySavings" | "OtherTransactions" | "DailySavingsCommission" | "ReferralsCommission";
    send_sms_notification?: boolean = false;
}  