export declare class DepositRequestDto {
    _id?: string;
    statement: string;
    amount: number;
    date: string;
    purpose: string;
    depositorName: string;
    requester_id: string;
    overseer_id: string;
    send_sms_notification?: boolean;
}
