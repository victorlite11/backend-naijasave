import { Injectable } from '@nestjs/common';
import { ContributorDto } from 'src/modules/core/dtos/contributor/contributor';
import { Feedback } from 'src/modules/core/misc/models.core/models.core';
import { CompanyDto } from 'src/modules/shared/dto/company/company-dto';
import { OverseerCommissionSummary, TransactionDto } from 'src/modules/shared/dto/transaction/transaction-dto';
import { TransactionsService } from 'src/modules/shared/services/transactions/transactions.service';
import { DbMediatorService } from '../../db-mediator/db-mediator.service';

@Injectable() 
export class CommissionService {

    constructor(
        private dbMediatorService : DbMediatorService,
        private transactionsService : TransactionsService
    ) {}

    async chargeFirstPaymentComission(op : {contributorId: string, paymentMethod: 'CASH' | 'ONLINE'}) : Promise<Feedback<number>> {
        // get contributor
        const contributor = await this.dbMediatorService.fetchOne <ContributorDto> (
            {_id : op.contributorId}, {collection : "contributors", db : "naijasave"}
        )
        
        /***
         * Get last transaction concerning the contributor
         * Get current date and check against the date of last transactions
         * If current date is greater than last transaction, it means it's a new month and the first payment
         * must be deducted as commission to both the company and the overseer
         */

        return await this.transactionsService.getSuccessfulTransactions({
            contributor_id : op.contributorId,
            type : "DEPOSIT"
        }).then(async trxs => {

            if (trxs.length < 2) {

                let amount = contributor.identity.isInvestor ? contributor.account.minimumDeposit : Number(contributor.account.dailySavings);
                
                // remove money from contributor
                await this.dbMediatorService.updateOne <ContributorDto> (
                    {_id : contributor._id},
                    {$set : {"account.balance": Number(contributor.account.balance) - amount}},
                    {collection : "contributors", db : "naijasave"}
                )
                
                // pay company
                await this.payCompanyCommission({amount: amount})

                // save transaction in successful transactions
                await this.transactionsService.addToSuccessfulTransactions({
                    amount : amount,
                    from : op.contributorId,
                    to : 'NAIJASAVE',
                    date : new Date().toISOString(),
                    method: op.paymentMethod,
                    send_sms_notification : false,
                    statement : "First deposit commission charge",
                    purpose : "DailySavingsCommission"
                })

                return {
                    success : true,
                    data : amount,
                    message : "First deposit commission charge"
                }

                // return await this.chargeComission({
                //     contributor : contributor,
                //     amount : contributor.identity.isInvestor ? contributor.account.minimumDeposit : Number(contributor.account.dailySavings),
                //     overseerId : contributor.basicInformation.overseerId,
                //     statement : "First deposit commission charge"
                // })
            }

        })    
    }

    async chargeContributorsMonthlyCommissions() {
        const contributors = await this.dbMediatorService.fetchAll <ContributorDto> (
            {}, {db : "naijasave", collection: "contributors"}
        );

        for(let i = 0; i < contributors.length; i++) {
            this.chargeMonthlyCommission({contributorId : contributors[i]._id, contributor: contributors[i]})
        }
    }

    async chargeMonthlyCommission(op : {contributorId : string, contributor?: ContributorDto}) {
        const contributor = op.contributor || await this.dbMediatorService.fetchOne <ContributorDto> (
            {_id : op.contributorId}, {db : "naijasave", collection : "contributors"}
        )
        
        const rawTrxs = await this.transactionsService.getSuccessfulTransactions({
            contributor_id : op.contributorId,
            type: "DEPOSIT"
        });

        const trx = rawTrxs.filter(t => t.purpose == "DailySavings");

        if (trx.length < 1 || 
                (!contributor.identity.isContributor && !contributor.identity.isInvestor) || 
                    (new Date().getMonth() == 7 && new Date().getFullYear() == 2021)) {
            return; // no dailydeposit transaction made or not a contributor or investor
        }

        let lastTrxDate = new Date(trx[trx.length - 1].date);
        let currentDate = new Date();

        // check if last transaction month is not same with current month
        if ((lastTrxDate.getFullYear() <= currentDate.getFullYear()) && (lastTrxDate.getMonth() < currentDate.getMonth())) {
            // get approval date
            let approvalDate = new Date(contributor.activities.approvalDate);

            if (approvalDate.getDate() <= currentDate.getDate()) {
                // contributor or investor is already in a new month, hence determine commission for deduction

                // all transactions for previous month
                const previousMonthTrxs = trx.filter(t => new Date(t.date).getMonth() == lastTrxDate.getMonth());

                // the investor's commission charge should be stored in db to provide ease of modification
                let commisionCharge : {contributor : number, investor : number} = {
                    contributor : Number(contributor.account.dailySavings),
                    investor : contributor.account.minimumDeposit
                }

                if (contributor.identity.isContributor) {
                    // determine commissionAmount
                    let expectedPreviousMonthTotalSavings = Number(contributor.account.dailySavings) * this.getLastDayOfMonth(lastTrxDate.toISOString());
                    let actualPreviousMonthTotalSavings = previousMonthTrxs.map(trx => trx.amount).reduce((prev, current) => prev + current);
                    
                    // if expectedTotalSavings is less than actualSavings, the commission should be x2
                    if (expectedPreviousMonthTotalSavings < actualPreviousMonthTotalSavings) {
                        // this multiplication is a penalty for extending beyond expected total savings per month
                        commisionCharge.contributor *= 2;
                    }
                }

                // payment
                if (await this.haveNotPaidThisMonthCommissionCharge({contributorId : op.contributorId})) {
                    // perform deduction
                    return await this.chargeComission({
                        contributor : contributor,
                        amount : contributor.identity.isInvestor ? commisionCharge.investor : commisionCharge.contributor,
                        overseerId : contributor.basicInformation.overseerId,
                        statement :`Monthly commission charge`
                    })
                }

            }
        }


    }

    private async chargeComission(op : {
        contributor: ContributorDto, overseerId: string, amount : number, statement : string
    }) : Promise<Feedback<number>> {
                    
        // remove money from contributor
        await this.dbMediatorService.updateOne <ContributorDto> (
            {_id : op.contributor._id},
            {$set : {"account.balance": Number(op.contributor.account.balance) - op.amount}},
            {collection : "contributors", db : "naijasave"}
        )

        // pay overseer
        return await this.payOverseerCommission({overseerId: op.overseerId, amount: this.takePercent(op.amount, 35)}).then(async feedback => {
            let paidOverseer = false;

            if (feedback.success) {
                paidOverseer = true;
                // pay company
                await this.payCompanyCommission({amount: this.takePercent(op.amount, 65)})
            } else {
                // pay company
                await this.payCompanyCommission({amount: this.takePercent(op.amount, 100)})
            }

            // save transaction in successful transactions
            await this.transactionsService.addToSuccessfulTransactions({
                amount : op.amount,
                from : op.contributor._id,
                to : 'NAIJASAVE',
                method: 'ONLINE',
                date : new Date().toISOString(),
                send_sms_notification : false,
                statement : op.statement,
                purpose : "DailySavingsCommission"
            })

            return {
                success : true,
                data : op.amount,
                message : op.statement
            }
        })
    }

    private async haveNotPaidThisMonthCommissionCharge(op : {contributorId : string}) : Promise<boolean> {

        const trxs = await this.transactionsService.getSuccessfulTransactions({
            contributor_id : op.contributorId,
            type: "WITHDRAWAL"
        });

        const thisMonthCommission = trxs
                                        .filter(trx => new Date(trx.date).getMonth() == new Date().getMonth())
                                            .map(trx => trx.purpose == "DailySavingsCommission")[0]
        
        if (thisMonthCommission) {
            // contributor has paid
            return false;
        } else {
            return true;
        }
    }

    private getLastDayOfMonth(dt : string) : number {
        let d = new Date(dt);
        d.setMonth(d.getMonth() + 1, 0);
        return d.getDate();
    }

    private takePercent(amount, percent) {
        return amount * (percent/100);
    }

    private async payOverseerCommission(op : {overseerId : string, amount : number}) : Promise<Feedback<boolean>> {
        
        let overseer = await this.dbMediatorService.fetchOne <ContributorDto> (
            {_id : op.overseerId}, {collection : "contributors", db: "naijasave"}
        )

        if (overseer) {

            if (overseer.identity.isSubContributor) {
                // pay overseer (if he or she is a super contributor)
                await this.payOverseerOverseerCommission({
                    amount : this.takePercent(op.amount, 10), overseerId : overseer.basicInformation.overseerId,
                    subContributorId : overseer._id
                }).then(async feedback => {
                    if (feedback.success) {
                        // take 90 percent of the commission and pay sub contributor
                        await this.dbMediatorService.updateOne <ContributorDto> (
                            {_id : op.overseerId},
                            {$set : {"account.commission.balance": Number(overseer.account.commission.balance) + this.takePercent(op.amount,90)}},
                            {collection : "contributors", db : "naijasave"}
                        )
                    } else {
                        // pay sub contributor full commission
                        await this.dbMediatorService.updateOne <ContributorDto> (
                            {_id : op.overseerId},
                            {$set : {"account.commission.balance": Number(overseer.account.commission.balance) + op.amount}},
                            {collection : "contributors", db : "naijasave"}
                        )
                    }
                })

            } else {
                // credit overseer
                await this.dbMediatorService.updateOne <ContributorDto> (
                    {_id : op.overseerId},
                    {$set : {"account.commission.balance": Number(overseer.account.commission.balance) + op.amount}},
                    {collection : "contributors", db : "naijasave"}
                )
            }

            return {
                success : true,
                data : true,
                message : "Overseer commission account credited"
            }
        } else {
            // if money should be credited to overseers who are also admins, implement it below
            return {
                success : false,
                data : false,
                message : "Overseer is not a contributor"
            }
        }
    }

    private async payOverseerOverseerCommission(op: {amount: number, subContributorId: string, overseerId: string}) {
         
        let overseer = await this.dbMediatorService.fetchOne <ContributorDto> (
            {_id : op.overseerId}, {collection : "contributors", db: "naijasave"}
        )

        // only pay overseer that is a super admin

        if (overseer && overseer.identity.isSuperContributor) {

            // credit overseer
            await this.dbMediatorService.updateOne <ContributorDto> (
                {_id : op.overseerId},
                {$set : {"account.commission.balance": Number(overseer.account.commission.balance + op.amount)}},
                {collection : "contributors", db : "naijasave"}
            )

            // save transaction in successful transactions
            await this.transactionsService.addToSuccessfulTransactions({
                amount : op.amount,
                from : op.subContributorId,
                to : 'NAIJASAVE',
                method: 'ONLINE',
                date : new Date().toISOString(),
                send_sms_notification : false,
                statement : "Benefit from DailyDeposit Commission",
                purpose : "DailySavingsCommission"
            })

            return {
                success : true,
                data : true,
                message : "Overseer commission account credited"
            }

        } else {
            // if money should be credited to overseers who are also admins, implement it below
            return {
                success : false,
                data : false,
                message : "Overseer is not a contributor"
            }
        }       
    }

    private async payCompanyCommission(op: {amount : number}) {
        let company = await this.dbMediatorService.fetchOne <CompanyDto> (
            {"credentials.password" : "bbC"},
            {collection : "company", db : "naijasave"}
        );
        
        // credit company
        await this.dbMediatorService.updateOne <CompanyDto> (
            {"credentials.password" : "bbC"},
            {$set : {"account.commission.balance": Number(company.account.commission.balance + op.amount)}},
            {collection : "company", db : "naijasave"}
        )

        return {
            success : true,
            data : true,
            message : "Company commission account credited"
        }
    }

    private async recordTransaction(contributorId : string, overseerId ?: string) {

    }
}
