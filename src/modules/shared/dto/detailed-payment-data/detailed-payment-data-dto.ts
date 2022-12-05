export class DetailedPaymentDataDto {
    purpose: string;
    statement: string;
    date: string;
    time: string;
    amount: number;
    payer: string; // name (account type)
    receiver: string; // name (account type)
    payerPhoneNumber: string;
    receiverPhoneNumber: string;
}