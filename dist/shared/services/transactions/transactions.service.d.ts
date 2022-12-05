import { DetailedPaymentDataDto } from 'src/modules/shared/dto/detailed-payment-data/detailed-payment-data-dto';
import { PaymentDto } from 'src/modules/shared/dto/payment/payment-dto';
import { AccountSummary, ContributorAccountSummary, OverseerCommissionSummary, TransactionDto } from 'src/modules/shared/dto/transaction/transaction-dto';
import { CompanyService } from '../company/company.service';
import { DbMediatorService } from '../db-mediator/db-mediator.service';
import { EntitiesMediatorService } from '../entities-mediator/entities-mediator/entities-mediator.service';
export declare class TransactionsService {
    private dbMediatorService;
    private companyService;
    private entitiesMediatorService;
    private idGenerator;
    constructor(dbMediatorService: DbMediatorService, companyService: CompanyService, entitiesMediatorService: EntitiesMediatorService);
    addToOngoingTransactions(paymentPayload: PaymentDto): Promise<string>;
    removeFromOngoingTransactions(paymentId: string): Promise<void>;
    addToFailedTransactions(paymentPayload: PaymentDto): Promise<void>;
    removeFromFailedTransactions(paymentId: string): Promise<void>;
    removeFromSuccessfulTransactions(paymentId: string): Promise<void>;
    addToSuccessfulTransactions(paymentPayload: PaymentDto): Promise<void>;
    getSuccessfulTransactions(op: {
        contributor_id?: string;
        type?: 'DEPOSIT' | 'WITHDRAWAL';
    }): Promise<TransactionDto[]>;
    fetchTransactionDetail(payment_id: string): Promise<DetailedPaymentDataDto>;
    calculateAndReturnAccountSummary(): Promise<AccountSummary>;
    getOverseersCommissionsSummary(op: {
        for: "super" | "sub";
    }): Promise<OverseerCommissionSummary[]>;
    getContributorsAccountSummary(op: {
        contributorId: string;
    }): Promise<ContributorAccountSummary>;
}
