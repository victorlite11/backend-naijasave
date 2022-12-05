import {HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AdminAccountModel, AdminDto, AdminPrivilegeModel } from 'src/modules/shared/dto/admin/admin-dto';
import { CompanyDto } from 'src/modules/shared/dto/company/company-dto';
import { AccountModel, ContributorDto, IdentityModel, PrivilegeModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { PaymentDto } from 'src/modules/shared/dto/payment/payment-dto';
import { OverseerCommissionSummary } from 'src/modules/shared/dto/transaction/transaction-dto';
import { EntityIdentity, IPaymentComplete, OperationFeedback, TradingBalanceTransactionPayload } from 'src/modules/shared/interface/shared-interfaces';
import { AccountingService } from '../accounting/accounting.service';
import { AdminService } from '../admin/admin.service';
import { ContributorsService } from '../contributors/contributors.service';
import { DbMediatorService } from '../db-mediator/db-mediator.service';
import { EntitiesMediatorService } from '../entities-mediator/entities-mediator/entities-mediator.service';
import { QualificationService } from '../qualification/qualification.service';
import { TransactionsService } from '../transactions/transactions.service';
 
@Injectable()
export class PaymentService {
    constructor(
        private entitiesMediatorService: EntitiesMediatorService,
        private adminService: AdminService,
        private dbMediatorService: DbMediatorService,
        private qualificationService: QualificationService,
        private contributorsService: ContributorsService,
        private accountingService: AccountingService,
        private transactionsService: TransactionsService
    ) {}

    async depositOnline(op: PaymentDto): Promise<IPaymentComplete> {
        if (op.method == "ONLINE") {
            // if isNan Return
            if(isNaN(Number(op.amount))) throw new HttpException('Invalid amount provided', HttpStatus.BAD_REQUEST)

            /***
             * Update the payer and company online payment account
            */

            // deduct money from company's online payment account
            const company = await this.dbMediatorService.fetchOne <CompanyDto> ({}, {
                collection: "company",
                db: "naijasave"
            })

            await this.dbMediatorService.updateOne <CompanyDto> ({}, {
                $set: {"account.onlinePayment.balance": Number(company.account.onlinePayment.balance) - Number(op.amount)}
            }, {collection: "company", db: "naijasave"})

            // add money to [to] account
            const contributor = await this.dbMediatorService.fetchOne <ContributorDto> (
                {_id: op.to}, {collection: "contributors", db: "naijasave"}
            );

            await this.dbMediatorService.updateOne <ContributorDto> (
                {_id: op.to},
                {$set: {"account.balance": Number(contributor.account.balance) + Number(op.amount)}},
                {collection: "contributors", db: "naijasave"}
            )

            return {
                status: "success",
                paymentData: op,
                message: "Deposit Successful!"
            }
        } else {
            return {
                status: "fail",
                paymentData: op,
                message: "Not online payment method"
            }
        }
    }

    async withdrawOnline(op: PaymentDto): Promise<IPaymentComplete> {
        if (op.method == "ONLINE") {
            // if isNan Return
            if(isNaN(Number(op.amount))) throw new HttpException('Invalid amount provided', HttpStatus.BAD_REQUEST)

            /***
             * Update the payer and company online payment account
            */

            // deduct money from company's online payment account
            const company = await this.dbMediatorService.fetchOne <CompanyDto> ({}, {
                collection: "company",
                db: "naijasave"
            })

            await this.dbMediatorService.updateOne <CompanyDto> ({}, {
                $set: {"account.onlinePayment.balance": Number(company.account.onlinePayment.balance) + Number(op.amount)}
            }, {collection: "company", db: "naijasave"})

            // add money to [to] account
            const contributor = await this.dbMediatorService.fetchOne <ContributorDto> (
                {_id: op.to}, {collection: "contributors", db: "naijasave"}
            );

            await this.dbMediatorService.updateOne <ContributorDto> (
                {_id: op.to},
                {$set: {"account.balance": Number(contributor.account.balance) - Number(op.amount)}},
                {collection: "contributors", db: "naijasave"}
            )

            return {
                status: "success",
                paymentData: op,
                message: "Withdrawal Successful!"
            }  
        } else {
            return {
                status: "fail",
                paymentData: op,
                message: "Not online payment method"
            }
        }
    }

    async payCommission(op: OverseerCommissionSummary) : Promise<OperationFeedback> {
        const overseer = await this.dbMediatorService.fetchOne <ContributorDto> (
            {_id : op.overseer_id}, {db : "naijasave", collection: "contributors"}
        )

        if (overseer.account.commission.balance < 100) {
            return {
                success : false,
                message : "Balance too low (can only pay commission earnings above N100)"
            } 
        }

        if (overseer) {
            // deduct amount
            await this.dbMediatorService.updateOne <ContributorDto> (
                {_id: overseer._id},
                {$set : {"account.commission.balance": overseer.account.commission.balance - overseer.account.commission.balance}},
                {db : "naijasave", collection : "contributors"}
            )

            // get company
            const company = await this.dbMediatorService.fetchOne <CompanyDto> (
                {"credentials.password": "bbC"},
                {db: "naijasave", collection: "company"}
            )

            // add to company's available balance
            await this.dbMediatorService.updateOne <CompanyDto> (
                {"credentials.password": "bbC"},
                {$set : {"account.availableTradingBalance": company.account.availableTradingBalance + overseer.account.commission.balance}},
                {db: "naijasave", collection : "company"}
            )

            return {
                success : true,
                message : "Overseer paid successfully"
            }
        } else {
            return {
                success : true,
                message : "Overseer unknown"
            } 
        }
    }

    async credit(paymentPayload: PaymentDto): Promise<IPaymentComplete> {
        console.log(paymentPayload);
        let fromEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.from);
        if(fromEntity.identity == EntityIdentity.CONTRIBUTOR) {
            // entity is contriutor
            return await this.creditDestinationAccountFromContributorAccount(paymentPayload, <ContributorDto>fromEntity.entity);
        } else {
            // entity is admin
            return await this.creditDestinationAccountFromAdminAccount(paymentPayload, <AdminDto>fromEntity.entity);
        }
    }

    async creditDestinationAccountFromAdminAccount(paymentPayload: PaymentDto, admin?: AdminDto): Promise<IPaymentComplete> {
        let fromAdmin = admin || await this.adminService.fetchAdmin(paymentPayload.from);
            
        // Qualification checks for Source Account
        await this.qualificationService.hasEnoughBalance(paymentPayload.amount, fromAdmin.account);
        await this.qualificationService.canCreditOthers(EntityIdentity.ADMIN, fromAdmin.privilege);

         
        let toEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.to);

        if ((toEntity.identity == EntityIdentity.CONTRIBUTOR)) {
            paymentPayload.purpose = "DailySavings";
            if ((<IdentityModel>toEntity.entity.identity).isContributor) {
                // should not be able to deposit more than his dailySavings
                // if(paymentPayload.amount !== toEntity.entity.account.dailySavings) {
                //     throw new HttpException("Contributor can only receive daily savings amount per transaction", HttpStatus.BAD_REQUEST)
                // }
            } 
            
            await this.checkIfContributorHasPaidHisDailySavingsForTheDate(paymentPayload)
        }

        // add amount to to-account and deduct from from-account
        let trx = this.accountingService.takeAmoutInFromAccountAndAddInToAccount({
            from: {
                account: fromAdmin.account,
                _id: fromAdmin._id,
                identity: EntityIdentity.ADMIN
            },
            to: {
                account: toEntity.entity.account,
                _id: toEntity.entity._id,
                identity: toEntity.identity
            },
            amount: paymentPayload.amount
        });

        // assign appropriate identities
        trx.from.identity = EntityIdentity.ADMIN;
        trx.to.identity = toEntity.identity;

        return new IPaymentComplete("success", "Transaction Successful", trx);

    }

    async creditDestinationAccountFromContributorAccount(paymentPayload: PaymentDto, contributor?: ContributorDto): Promise<IPaymentComplete> {
        let fromContributor = contributor || await this.contributorsService.fetchContributor(paymentPayload.from);

        // Qualification checks for Source Account
        await this.qualificationService.hasEnoughBalance(paymentPayload.amount, fromContributor.account);
        await this.qualificationService.canCreditOthers(EntityIdentity.CONTRIBUTOR, fromContributor.privilege);

        let toEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.to);

        if ((toEntity.identity == EntityIdentity.CONTRIBUTOR)) {
            paymentPayload.purpose = "DailySavings";
            if ((<IdentityModel>toEntity.entity.identity).isContributor) {
                // should not be able to deposit more than his dailySavings
                // if(paymentPayload.amount !== toEntity.entity.account.dailySavings) {
                //     throw new HttpException("Contributor can only receive daily savings amount per transaction", HttpStatus.BAD_REQUEST)
                // }
            }  

            await this.checkIfContributorHasPaidHisDailySavingsForTheDate(paymentPayload)         
        }

        // add amount to to-account and deduct from from-account
        let trx = this.accountingService.takeAmoutInFromAccountAndAddInToAccount({
            from: {
                account: fromContributor.account,
                _id: fromContributor._id,
                identity: EntityIdentity.CONTRIBUTOR
            },
            to: {
                account: toEntity.entity.account,
                _id: toEntity.entity._id,
                identity: toEntity.identity
            },
            amount: paymentPayload.amount
        });

        // assign appropriate identities
        trx.from.identity = EntityIdentity.CONTRIBUTOR;
        trx.to.identity = toEntity.identity

        return new IPaymentComplete("success", "Transaction Successful", trx);
    }

    private async checkIfContributorHasPaidHisDailySavingsForTheDate(paymentPayload: PaymentDto) {
                  // if contributor has already paid daily savings for that day
        let contributorTrxs = await this.transactionsService.getSuccessfulTransactions({
            contributor_id: paymentPayload.to,
            type : "DEPOSIT"
        });

        let paymentDate = new Date(paymentPayload.date).toLocaleDateString();
        
        let didDailyDepositPaymentSameDate = contributorTrxs.filter(trx => {
            return (new Date(trx.date).toLocaleDateString() == paymentDate)
        })[0]

        // if (didDailyDepositPaymentSameDate) {
        //     throw new HttpException("Contributor can only receive daily savings once per day", HttpStatus.BAD_REQUEST) 
        // } 
    }

    // debit with Checks
    async debitWithChecks(paymentPayload: PaymentDto): Promise<IPaymentComplete> {
        let fromEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.from);
        if(fromEntity.identity == EntityIdentity.CONTRIBUTOR) {
            // entity is contriutor
            return await this.debitContributorWithChecks(paymentPayload, <ContributorDto>fromEntity.entity);
        } else {
            // entity is admin
            return await this.debitAdminWithChecks(paymentPayload, <AdminDto>fromEntity.entity);
        }
    }

    async debitContributorWithChecks(paymentPayload: PaymentDto, contributor?: ContributorDto): Promise<IPaymentComplete> {
        let fromContributor = contributor || await this.contributorsService.fetchContributor(paymentPayload.from);

        // Qualification checks
        await this.qualificationService.hasEnoughBalance(paymentPayload.amount, fromContributor.account);
        await this.qualificationService.canWithdraw(EntityIdentity.CONTRIBUTOR, fromContributor.privilege);
        
        
        
        // money can only be debited into an admin account
        // check if to account is an admin, if not, go up the overseerId tree uptil u get an admin
        // if(await this.entitiesMediatorService.isContributor(paymentPayload.to)) {
        //     let id: string = paymentPayload.to;
        //     while(await this.entitiesMediatorService.isContributor(id)) {
        //         id = (await this.entitiesMediatorService.fetchEntity(id)).entity.basicInformation.overseerId;
        //     }
        //     paymentPayload.to = id; // changed to an admin id if it was contributor's
        // }

        let toEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.to);

        // Qualification checks
        await this.qualificationService.canDebitOthersWithChecks(toEntity.identity, toEntity.entity.privilege)

        // add amount to to-account and deduct from from-account
        let trx = this.accountingService.takeAmoutInFromAccountAndAddInToAccount({
            from: {
                account: fromContributor.account,
                _id: fromContributor._id,
                identity: EntityIdentity.CONTRIBUTOR
            },
            to: {
                account: toEntity.entity.account,
                _id: toEntity.entity._id,
                identity: toEntity.identity
            },
            amount: paymentPayload.amount
        });

        // assign appropriate identities
        trx.from.identity = EntityIdentity.CONTRIBUTOR;
        trx.to.identity = toEntity.identity;

        return new IPaymentComplete("success", "Transaction Successful", trx);

    }

    async debitAdminWithChecks(paymentPayload: PaymentDto, admin?: AdminDto): Promise<IPaymentComplete> {
        let fromAdmin = admin || await this.adminService.fetchAdmin(paymentPayload.from);

        // Qualification checks
        await this.qualificationService.hasEnoughBalance(paymentPayload.amount, fromAdmin.account);
        await this.qualificationService.canWithdraw(EntityIdentity.ADMIN, fromAdmin.privilege);
         
        // money can only be debited into an admin account
        // check if to account is an admin, if not, go up the overseerId tree uptil u get an admin
        // if(await this.entitiesMediatorService.isContributor(paymentPayload.to)) {
        //     let id: string = paymentPayload.to;
        //     while(await this.entitiesMediatorService.isContributor(id)) {
        //         id = (await this.entitiesMediatorService.fetchEntity(id)).entity.basicInformation.overseerId;
        //     }
        //     paymentPayload.to = id; // changed to an admin id if it was contributor's
        // }

        let toEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.to);
        
        // Qualification checks
        await this.qualificationService.canDebitOthersWithChecks(toEntity.identity, toEntity.entity.privilege)

        // add amount to to-account and deduct from from-account
        let trx = this.accountingService.takeAmoutInFromAccountAndAddInToAccount({
            from: {
                account: fromAdmin.account,
                _id: fromAdmin._id,
                identity: EntityIdentity.ADMIN
            },
            to: {
                account: toEntity.entity.account,
                _id: toEntity.entity._id,
                identity: toEntity.identity
            },
            amount: paymentPayload.amount
        });

        // assign appropriate identities
        trx.from.identity = EntityIdentity.CONTRIBUTOR;
        trx.to.identity = toEntity.identity;

        return new IPaymentComplete("success", "Transaction Successful", trx);

    }

    // debit Without Checks
    async debitWithoutChecks(paymentPayload: PaymentDto): Promise<IPaymentComplete> {
        let fromEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.from);
        if(fromEntity.identity == EntityIdentity.CONTRIBUTOR) {
            // entity is contriutor
            return await this.debitContributorWithoutChecks(paymentPayload, <ContributorDto>fromEntity.entity);
        } else {
            // entity is admin
            return await this.debitAdminWithoutChecks(paymentPayload, <AdminDto>fromEntity.entity);
        }
    }

    async debitContributorWithoutChecks(paymentPayload: PaymentDto, contributor?: ContributorDto): Promise<IPaymentComplete> {
        let fromContributor = contributor || await this.contributorsService.fetchContributor(paymentPayload.from);

        // money can only be debited into an admin account
        // check if to account is an admin, if not, go up the overseerId tree uptil u get an admin
        // if(await this.entitiesMediatorService.isContributor(paymentPayload.to)) {
        //     let id: string = paymentPayload.to;
        //     while(await this.entitiesMediatorService.isContributor(id)) {
        //         id = (await this.entitiesMediatorService.fetchEntity(id)).entity.basicInformation.overseerId;
        //     }
        //     paymentPayload.to = id; // changed to an admin id if it was contributor's
        // }

        let toEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.to);
        
        // Qualification checks
        await this.qualificationService.canDebitOthersWithoutChecks(toEntity.identity, toEntity.entity.privilege)

        // add amount to to-account and deduct from from-account
        let trx = this.accountingService.takeAmoutInFromAccountAndAddInToAccount({
            from: {
                account: fromContributor.account,
                _id: fromContributor._id,
                identity: EntityIdentity.CONTRIBUTOR
            },
            to: {
                account: toEntity.entity.account,
                _id: toEntity.entity._id,
                identity: toEntity.identity
            },
            amount: paymentPayload.amount
        });

        // assign appropriate identities
        trx.from.identity = EntityIdentity.CONTRIBUTOR;
        trx.to.identity = toEntity.identity;

        return new IPaymentComplete("success", "Transaction Successful", trx);

    }

    async debitAdminWithoutChecks(paymentPayload: PaymentDto, admin?: AdminDto): Promise<IPaymentComplete> {
        let fromAdmin = admin || await this.adminService.fetchAdmin(paymentPayload.from);

        // money can only be debited into an admin account
        // check if to account is an admin, if not, go up the overseerId tree uptil u get an admin
        // if(await this.entitiesMediatorService.isContributor(paymentPayload.to)) {
        //     let id: string = paymentPayload.to;
        //     while(await this.entitiesMediatorService.isContributor(id)) {
        //         id = (await this.entitiesMediatorService.fetchEntity(id)).entity.basicInformation.overseerId;
        //     }
        //     paymentPayload.to = id; // changed to an admin id if it was contributor's
        // }

        let toEntity = await this.entitiesMediatorService.fetchEntity(paymentPayload.to);
        
        // Qualification checks
        await this.qualificationService.canDebitOthersWithoutChecks(toEntity.identity, toEntity.entity.privilege)

        // add amount to to-account and deduct from from-account
        let trx = this.accountingService.takeAmoutInFromAccountAndAddInToAccount({
            from: {
                account: fromAdmin.account,
                _id: fromAdmin._id,
                identity: EntityIdentity.ADMIN
            },
            to: {
                account: toEntity.entity.account,
                _id: toEntity.entity._id,
                identity: toEntity.identity
            },
            amount: paymentPayload.amount
        });

        // assign appropriate identities
        trx.from.identity = EntityIdentity.ADMIN;
        trx.to.identity = toEntity.identity;

        return new IPaymentComplete("success", "Transaction Successful", trx);

    }

    // trading balance stuff
    async fundAdminAccount(payload: TradingBalanceTransactionPayload): Promise<OperationFeedback> {
        let admin = await this.dbMediatorService.fetchAdmin({
            "credentials.username": payload.admin_username
        });

        if(!admin) {
            throw new HttpException("No admin with the username provided", HttpStatus.EXPECTATION_FAILED)
        }

        let company = await this.dbMediatorService.fetchCompanyData({
            "credentials.password": payload.password
        });

        if(!company) {
            throw new HttpException("Invalid Company Authorization Password (CAP) provided", HttpStatus.EXPECTATION_FAILED)
        }

        if (company.account.availableTradingBalance < payload.amount) {
            throw new HttpException("Company available balance not enough to fund admin", HttpStatus.BAD_REQUEST)
        }

        // remove the amount from trading balance first
        let companyAccount = this.accountingService.debitAvailTradingBalance({
            amount: payload.amount,
            account: company.account
        });

        let adminAccount = this.accountingService.plusBalance({amount: payload.amount, account: admin.account});

        // update data
        await this.dbMediatorService.updateCompanyData({
            "credentials.password": payload.password
        }, {
            $set: {account: companyAccount}
        });

        await this.dbMediatorService.updateAdmin(
            {
                _id: admin._id,
            },
            {
                $set: {
                    "account": adminAccount as AdminAccountModel
                }
            }
        );

        return {success: true, message: "Admin account funded"}
    }

    async debitAdminAccount(payload: TradingBalanceTransactionPayload): Promise<OperationFeedback> {
        let admin = await this.dbMediatorService.fetchAdmin({
            "credentials.username": payload.admin_username
        });  
        
        if(!admin) {
            throw new HttpException("No admin with the username provided", HttpStatus.EXPECTATION_FAILED)
        }

        if (admin.account.balance < payload.amount) {
            throw new HttpException("Insufficient admin account balance", HttpStatus.BAD_REQUEST)
        }

        let company = await this.dbMediatorService.fetchCompanyData({
            "credentials.password": payload.password
        });

        if(!company) {
            throw new HttpException("Invalid Company Authorization Password (CAP) provided", HttpStatus.EXPECTATION_FAILED)
        }

        let account = this.accountingService.creditAvailTradingBalance({
            amount: payload.amount,
            account: company.account
        });

        let adminAccount = this.accountingService.minusBalance({amount: payload.amount, account: admin.account});

        await this.dbMediatorService.updateAdmin(
            {
                _id: admin._id,
            },
            {
                $set: {
                    "account": adminAccount as AdminAccountModel
                }
            }
        );

        // update data
        await this.dbMediatorService.updateCompanyData({
            "credentials.password": payload.password
        }, {
            $set: {account: account}
        });

        return {success: true, message: "Admin account debited"}
    }

    async updateTradingBalance(payload: TradingBalanceTransactionPayload): Promise<OperationFeedback> {
        let admin = await this.dbMediatorService.fetchAdmin({
            "credentials.username": payload.admin_username
        });  
        
        if(!admin) {
            throw new HttpException("No admin with the username provided", HttpStatus.EXPECTATION_FAILED)
        }

        let company = await this.dbMediatorService.fetchCompanyData({
            "credentials.password": payload.password
        });

        if(!company) {
            throw new HttpException("Invalid Company Authorization Password (CAP) provided", HttpStatus.EXPECTATION_FAILED)
        }

        if(company.account.tradingBalance > payload.amount) {
            throw new HttpException("New trading balance must be more than previous trading balance", HttpStatus.EXPECTATION_FAILED)
        }

        let account = this.accountingService.updateTradingBalance({
            amount: payload.amount,
            account: company.account
        });

        // update data
        await this.dbMediatorService.updateCompanyData({
            "credentials.password": payload.password
        }, {
            $set: {account: account}
        });

        return {success: true, message: "Trading balance updated"}
    }

}
