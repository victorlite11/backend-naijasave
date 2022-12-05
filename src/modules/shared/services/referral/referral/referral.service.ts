import { Injectable } from '@nestjs/common';
import { ContributorDto, ReferralModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { BasicContributorDto } from 'src/modules/shared/dto/basic-contributor/basic-contributor-dto';
import { ContributorsService } from '../../contributors/contributors.service';
import { DbMediatorService } from '../../db-mediator/db-mediator.service';
import { AccountingService } from '../../accounting/accounting.service';
import { SubordinatesService } from '../../subordinates/subordinates/subordinates.service';
import { CompanyService } from '../../company/company.service';
import { TransactionsService } from '../../transactions/transactions.service';
import { EntitiesMediatorService } from '../../entities-mediator/entities-mediator/entities-mediator.service';
import { CompanyDto } from 'src/modules/shared/dto/company/company-dto';
import { ReferralData } from 'src/modules/shared/interface/shared-interfaces';
import { Feedback } from 'src/modules/core/misc/models.core/models.core';

@Injectable()
export class ReferralService {
    constructor(
        private contributorsService: ContributorsService,
        private transactionsService: TransactionsService,
        private dbMediatorService: DbMediatorService) {

    }

    async fetchReferred(referralCode: string): Promise<BasicContributorDto[]> {
        let referred = await this.dbMediatorService.fetchContributors({"basicInformation.referrer": referralCode})
        let result:BasicContributorDto[] = [];
        referred.forEach(r => {
            let referred = new BasicContributorDto();
            referred.name = r.basicInformation.name;
            referred.phoneNumber = r.credentials.phoneNumber;
            referred.status = r.activities.status;
            result.push(referred);
        });
        return result;
    }

    async payReferralCommission(op: {contributorId: string, amount: number}) : Promise<Feedback<string>> {

        /***
         * Pay the beneficiary when this contributor makes his or her first fifth dailydeposit
         */ 

        let trxs = await this.transactionsService.getSuccessfulTransactions({
            contributor_id : op.contributorId,
            type : "DEPOSIT"
        });

        const dailyDepositTrxs = trxs.map(trx => trx.purpose).filter(purpose => purpose == "DailySavings");

        if(dailyDepositTrxs.length == 5) {
            // get contributor
            let contributor = await this.dbMediatorService.fetchOne <ContributorDto> (
                {_id : op.contributorId}, {collection : "contributors", db: "naijasave"}
            )

            // Continue only if there is a referral code
            if (contributor.basicInformation.referralCode) {  
                // get beneficiary
                let beneficiary = await this.dbMediatorService.fetchOne <ContributorDto> (
                    {"referral.code": contributor.basicInformation.referralCode}, {collection : "contributors", db: "naijasave"}
                );

                if (beneficiary) {
                    let company = await this.dbMediatorService.fetchOne <CompanyDto> (
                        {"credentials.password": "bbC"}, {collection : "company", db : "naijasave"}
                    )

                    if (company) {
                        // update company available trading balance
                        this.dbMediatorService.updateOne <CompanyDto> ({}, {
                            $set : {"account.availableTradingBalance": Number(company.account.availableTradingBalance) - op.amount}
                        }, {collection : "company", db : "naijasave"})

                        // update beneficiary balance
                        this.dbMediatorService.updateOne <ContributorDto> ({_id : beneficiary._id}, {
                            $set : {"referral.balance": Number(beneficiary.referral.balance) + op.amount}
                        }, {collection : "contributors", db : "naijasave"})

                        // save transaction in successful transactions
                        await this.transactionsService.addToSuccessfulTransactions({
                            amount : op.amount,
                            from : op.contributorId,
                            to : beneficiary._id,
                            method: 'ONLINE',
                            date : new Date().toISOString(),
                            send_sms_notification : false,
                            statement : "Referral Commission",
                            purpose : "ReferralsCommission"
                        });

                        return {
                            success : true,
                            message : "Referral Commission paid",
                            data : beneficiary._id
                        }
                    }
                }


            }

        }

    }

    async constructAndReturnReferralData(op: {contributor_id: string}): Promise<ReferralData> {
        const contributor = await this.dbMediatorService.fetchOne <ContributorDto> ({_id : op.contributor_id}, {collection : "contributors", db: "naijasave"})
   
        const referred = await this.dbMediatorService.fetchAll <ContributorDto> (
                {"basicInformation.referralCode": contributor.referral.code}, {collection : "contributors", db : "naijasave"}
            )
        return <ReferralData> {
            balance : contributor.referral.balance,
            code : contributor.referral.code,
            referred : referred.filter(c => c.basicInformation.referralCode == contributor.referral.code).map <BasicContributorDto> (c => {
                return {
                    _id : c._id,
                    name : c.basicInformation.name,
                    phoneNumber : c.credentials.phoneNumber,
                    imageUrl : "",
                    status : c.activities.status
                }
            })
        }

    }
}
