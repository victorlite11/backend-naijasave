import { BankDetails } from "../contributor/contributor-dto";
export declare class WithdrawalRequestDto {
    _id?: string;
    statement: string;
    amount: number;
    date: string;
    purpose: string;
    withdrawerName: string;
    bankDetails?: BankDetails;
    requester_id: string;
    overseer_id: string;
    send_sms_notification?: boolean;
}
