import { Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { DetailedPaymentDataDto } from 'src/modules/shared/dto/detailed-payment-data/detailed-payment-data-dto';
import { AccountSummary, ContributorAccountSummary, OverseerCommissionSummary, TransactionDto } from 'src/modules/shared/dto/transaction/transaction-dto';
import { AdminGuard } from 'src/modules/shared/guards/admin/admin.guard';
import { AuthenticatedGuard } from 'src/modules/shared/guards/authenticated/authenticated.guard';
import { TransactionsService } from 'src/modules/shared/services/transactions/transactions.service';

@Controller('transactions')
@UseGuards(AuthenticatedGuard)
export class TransactionsController {
    constructor(
        private transactionsService: TransactionsService
    ) {}
    @Get('contributor-history')
    async fetchHistory(@Query('contributor_id') contributor_id: string): Promise<TransactionDto[]> {
        return await this.transactionsService.getSuccessfulTransactions({
            contributor_id: contributor_id
        })
    }

    @Get('contributor-account-summary')
    async getContributorAccountSummary(@Query('contributor_id') contributor_id: string): Promise<ContributorAccountSummary> {
        return await this.transactionsService.getContributorsAccountSummary({
            contributorId: contributor_id
        })
    }

    @Get('overseers-commissions-summary')
    async getOverseersCommissionsSummary(@Query('for') target_overseers: "super" | "sub"): Promise<OverseerCommissionSummary[]> {
        return await this.transactionsService.getOverseersCommissionsSummary({
            for : target_overseers
        })
    }

    @Get('all-history')
    @UseGuards(AdminGuard)
    async fetchAllSuccessfulHistory(): Promise<TransactionDto[]> {
        
        return await this.transactionsService.getSuccessfulTransactions({})
    }

    @Get('transaction-details')
    async fetchTransactionDetails(
        @Query('payment_id') payment_id: string
    ): Promise<DetailedPaymentDataDto> {
        return await this.transactionsService.fetchTransactionDetail(payment_id);
    }

    @Get('account-summary')
    @UseGuards(AdminGuard)
    async accountSummary(): Promise<AccountSummary> {
        return await this.transactionsService.calculateAndReturnAccountSummary();
    }
}
