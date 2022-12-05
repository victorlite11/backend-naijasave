import { BankDetails } from "../contributor/contributor-dto";

export class WithdrawalRequestDto {
    _id?: string;
    statement: string;
    amount: number;
    date: string;
    purpose: string;
    withdrawerName: string;
    bankDetails?: BankDetails;
    requester_id: string;
    overseer_id: string;
    send_sms_notification?: boolean = false;
}