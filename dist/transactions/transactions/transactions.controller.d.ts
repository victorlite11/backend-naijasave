import { DetailedPaymentDataDto } from 'src/modules/shared/dto/detailed-payment-data/detailed-payment-data-dto';
import { AccountSummary, ContributorAccountSummary, OverseerCommissionSummary, TransactionDto } from 'src/modules/shared/dto/transaction/transaction-dto';
import { TransactionsService } from 'src/modules/shared/services/transactions/transactions.service';
export declare class TransactionsController {
    private transactionsService;
    constructor(transactionsService: TransactionsService);
    fetchHistory(contributor_id: string): Promise<TransactionDto[]>;
    getContributorAccountSummary(contributor_id: string): Promise<ContributorAccountSummary>;
    getOverseersCommissionsSummary(target_overseers: "super" | "sub"): Promise<OverseerCommissionSummary[]>;
    fetchAllSuccessfulHistory(): Promise<TransactionDto[]>;
    fetchTransactionDetails(payment_id: string): Promise<DetailedPaymentDataDto>;
    accountSummary(): Promise<AccountSummary>;
}
