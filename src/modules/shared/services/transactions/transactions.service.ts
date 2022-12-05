import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AdminDto } from 'src/modules/shared/dto/admin/admin-dto';
import { CompanyDto } from 'src/modules/shared/dto/company/company-dto';
import { ContributorDto } from 'src/modules/shared/dto/contributor/contributor-dto';
import { DetailedPaymentDataDto } from 'src/modules/shared/dto/detailed-payment-data/detailed-payment-data-dto';
import { PaymentDto } from 'src/modules/shared/dto/payment/payment-dto';
import { AccountSummary, ContributorAccountSummary, OverseerCommissionSummary, TransactionDto } from 'src/modules/shared/dto/transaction/transaction-dto';
import { IdGenerator } from 'src/modules/shared/helpers/id-generator/id-generator';
import { CompanyService } from '../company/company.service';
import { DbMediatorService } from '../db-mediator/db-mediator.service';
import { EntitiesMediatorService } from '../entities-mediator/entities-mediator/entities-mediator.service';

@Injectable()
export class TransactionsService {
    
    private idGenerator = new IdGenerator()

    constructor(
        private dbMediatorService: DbMediatorService,
        private companyService: CompanyService,
        private entitiesMediatorService: EntitiesMediatorService
    ) {}

    async addToOngoingTransactions(paymentPayload: PaymentDto): Promise<string> {
        if(!paymentPayload.date) {
            paymentPayload.date = new Date().toISOString();
        }
        
        // create payment id
        if(!paymentPayload._id) {
            paymentPayload._id = this.idGenerator.simpleId({multiplier: 99999999});
        }

        await this.dbMediatorService.insertOne <PaymentDto> (paymentPayload, {
            collection : "ongoing_transactions",
            db : "naijasave"
        })

        return paymentPayload._id;
    }

    async removeFromOngoingTransactions(paymentId: string) {

        await this.dbMediatorService.deleteOne <PaymentDto> ({
            _id : paymentId
        }, {collection : "ongoing_transactions", db : "naijasave"})

    }

    async addToFailedTransactions(paymentPayload: PaymentDto) {
        await this.dbMediatorService.insertOne <PaymentDto> (paymentPayload, {
            collection : "failed_transactions",
            db : "naijasave"
        })
    }

    async removeFromFailedTransactions(paymentId: string) {
        await this.dbMediatorService.deleteOne <PaymentDto> (
            {_id : paymentId}, {collection : "failed_transactions", db : "naijasave"}
        )
    }

    async removeFromSuccessfulTransactions(paymentId: string) {
        await this.dbMediatorService.deleteOne <PaymentDto> (
            {_id : paymentId}, {collection : "successful_transactions", db : "naijasave"}
        )
    }

    async addToSuccessfulTransactions(paymentPayload: PaymentDto) {
        if (!paymentPayload._id) {
            paymentPayload._id = IdGenerator.generateKey(9);
        }

        await this.dbMediatorService.insertOne <PaymentDto> (
            paymentPayload, {collection : "successful_transactions", db : "naijasave"}
        )
    }

    async getSuccessfulTransactions(op : {
        contributor_id?: string,
        type ?: 'DEPOSIT' | 'WITHDRAWAL'
    }): Promise<TransactionDto[]> {
        
        let basicTrxs: TransactionDto[] = [];
        if (op.contributor_id) {
            let query = {}
            if (op.type) {
                query = op.type == "DEPOSIT" ? {to : op.contributor_id} : {from : op.contributor_id}
            } else {
                query = {$or : [{from : op.contributor_id}, {to : op.contributor_id}]}
            }

            // fetch for that contributor
            let trxs = await this.dbMediatorService.fetchAll <PaymentDto> (
                            query, {collection : "successful_transactions", db : "naijasave"}
                        )

            basicTrxs = trxs.map <TransactionDto> (trx => {
                return {
                    _id : trx._id,
                    purpose : trx.purpose,
                    amount : trx.amount,
                    method: trx.method || 'CASH',
                    statement: trx.statement,
                    date: trx.date,
                }
            })

        } else {
            // fetch for all contributors
            let trxs = await this.dbMediatorService.fetchAll <PaymentDto> (
                {}, {collection : "successful_transactions", db : "naijasave"}
            )

            basicTrxs = trxs.map <TransactionDto> (trx => {
                return {
                    _id : trx._id,
                    purpose : trx.purpose,
                    amount : trx.amount,
                    method : trx.method || 'CASH',
                    statement: trx.statement,
                    date: trx.date
                }
            })      
        }


        return basicTrxs;
    }

    async fetchTransactionDetail(payment_id: string): Promise<DetailedPaymentDataDto> {
        let paymentData = await this.dbMediatorService.fetchOne <PaymentDto> (
            {_id : payment_id}, {collection : "successful_transactions", db : "naijasave"}
        )
        let detailedTransaction = new DetailedPaymentDataDto();

        // date obj

        detailedTransaction.amount = paymentData.amount;
        detailedTransaction.date = paymentData.date;
        detailedTransaction.purpose = paymentData.purpose;
        detailedTransaction.statement = paymentData.statement;
        detailedTransaction.time = paymentData.date;
        
        // get payer detail
        if(paymentData.from.toUpperCase() !== "NAIJASAVE") {
            let e = await this.entitiesMediatorService.fetchEntity(paymentData.from);
            detailedTransaction.payer = e.entity.basicInformation.name;
            detailedTransaction.payerPhoneNumber = e.entity.credentials.phoneNumber;
        } else {
            detailedTransaction.payer = 'NAIJASAVE'
            detailedTransaction.payerPhoneNumber = 'NAIJASAVE'
        }

        if(paymentData.to.toUpperCase() !== "NAIJASAVE") {
            // get receiver detail
            let e = await this.entitiesMediatorService.fetchEntity(paymentData.to);
            detailedTransaction.receiver = e.entity.basicInformation.name;
            detailedTransaction.receiverPhoneNumber = e.entity.credentials.phoneNumber;
        } else {
            detailedTransaction.receiver = "NAIJASAVE";
            detailedTransaction.receiverPhoneNumber = "NAIJASAVE";  
        }

        return detailedTransaction;
    }

    async calculateAndReturnAccountSummary() : Promise<AccountSummary> {
        let company = await this.dbMediatorService.fetchOne <CompanyDto>({}, {
            collection : "company", db: "naijasave"
        })

        if(!company) {
            throw new HttpException("Invalid Company Authorization Password (CAP) provided", HttpStatus.EXPECTATION_FAILED)
        }


        const accountSummary = new AccountSummary();
        
    
        // summarize contributors account
        let contributors = await this.dbMediatorService.fetchAll <any> ({}, {
            db : "naijasave", collection : "contributors"
        }) as ContributorDto[]

        accountSummary.contributors.total = contributors.map(c => c.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.contributors.contributors = contributors.filter(c => c.identity.isContributor).map(c => c.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.contributors.investors = contributors.filter(c => c.identity.isInvestor).map(c => c.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.contributors.subContributors = contributors.filter(c => c.identity.isSubContributor).map(c => c.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.contributors.superContributors = contributors.filter(c => c.identity.isSuperContributor).map(c => c.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
    
        // summarise company, super and sub contributors commission balance
        accountSummary.commissions.superContributors = contributors.filter(c => c.identity.isSuperContributor).map(c => c.account.commission.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.commissions.superContributors = contributors.filter(c => c.identity.isSubContributor).map(c => c.account.commission.balance).reduce((prev, current) => Number(prev) + Number(current), 0);

        accountSummary.commissions.company = company.account.commission.balance
        
        // summarize admin account
        let admins = await this.dbMediatorService.fetchAll <any> ({}, {
            db : "naijasave", collection : "admins"
        }) as AdminDto[]

        accountSummary.admins.total = admins.map(a => a.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.admins.headAdmin = admins.filter(a => a.identity.isHeadAdmin).map(a => a.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.admins.superAdmin = admins.filter(a => a.identity.isSuperAdmin).map(a => a.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);
        accountSummary.admins.subAdmin = admins.filter(a => a.identity.isSubAdmin).map(a => a.account.balance).reduce((prev, current) => Number(prev) + Number(current), 0);


        return accountSummary;
    }

    async getOverseersCommissionsSummary(op: {for: "super" | "sub"}) : Promise<OverseerCommissionSummary[]> {
        let overseers : ContributorDto[] = []
        if(op.for == "super") {
            overseers = await this.dbMediatorService.fetchAll <ContributorDto> (
                {"identity.isSuperContributor": true},
                {db : "naijasave", collection : "contributors"}
            )
        } else {
            overseers = await this.dbMediatorService.fetchAll <ContributorDto> (
                {"identity.isSubContributor": true},
                {db : "naijasave", collection : "contributors"}
            )
        }

        return overseers.map <OverseerCommissionSummary> (overseer => {
            return {
                overseer_id: overseer._id,
                name : overseer.basicInformation.name,
                balance : overseer.account.commission.balance
            }
        })

    }

    async getContributorsAccountSummary(op: {contributorId: string}) : Promise<ContributorAccountSummary> {
        const contributor = await this.dbMediatorService.fetchOne <ContributorDto> (
            {_id : op.contributorId},
            {db : "naijasave", collection : "contributors"}
        )

        const accountSummary = new ContributorAccountSummary();

        if(contributor) {
            // get all successfull transactions

            // deposits
            let depositTrxs = await this.getSuccessfulTransactions({
                contributor_id : op.contributorId,
                type: "DEPOSIT"
            });
            accountSummary.totalDeposit = depositTrxs.filter(trx => trx.purpose !== "ReferralsCommission").map(trx => trx.amount).reduce((prev, current) => prev + current, 0)

            // withdrawals
            let withdrawalTrxs = await this.getSuccessfulTransactions({
                contributor_id : op.contributorId,
                type: "WITHDRAWAL"
            });
            accountSummary.totalWithdrawn = withdrawalTrxs.filter(trx => trx.purpose !== "ReferralsCommission" && trx.purpose !== "DailySavingsCommission").map(trx => trx.amount).reduce((prev, current) => prev + current, 0)
            accountSummary.balance = contributor.account.balance;

            return accountSummary;

        } else {
            return accountSummary;
        }
    }
}
