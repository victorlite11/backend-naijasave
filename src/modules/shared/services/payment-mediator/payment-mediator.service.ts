import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentDto } from 'src/modules/shared/dto/payment/payment-dto';
import { OverseerCommissionSummary } from 'src/modules/shared/dto/transaction/transaction-dto';
import { EntityIdentity, IPaymentComplete, ITakeAmoutInFromAccountAndAddInToAccount, OperationFeedback, TradingBalanceTransactionPayload } from 'src/modules/shared/interface/shared-interfaces';
import { CommissionService } from '../commission/commission/commission.service';
import { ContributorsService } from '../contributors/contributors.service';
import { EntitiesMediatorService } from '../entities-mediator/entities-mediator/entities-mediator.service';
import { PaymentTicksService } from '../payment-ticks/payment-ticks/payment-ticks.service';
import { PaymentService } from '../payment/payment.service';
import { ReferralService } from '../referral/referral/referral.service';
import { RequestsService } from '../requests/requests.service';
import { SmsMediatorService } from '../sms-mediator/sms-mediator/sms-mediator.service';
import { TransactionsService } from '../transactions/transactions.service';
 
@Injectable()
export class PaymentMediatorService {
    constructor(
        private entitiesMediatorService: EntitiesMediatorService,
        private transactionsService: TransactionsService,
        private paymentService: PaymentService,
        private paymentTicksService: PaymentTicksService,
        private referralService: ReferralService,
        private requestsService: RequestsService,
        private smsMediatorService: SmsMediatorService,
        private contributorsService: ContributorsService,
        private commissionService : CommissionService
        ) {}

    async withdrawOnline(payload: PaymentDto): Promise<IPaymentComplete> {
        // register payment in ongoingTransactions
        let trxId = await this.transactionsService.addToOngoingTransactions(payload);  
        
        return await this.paymentService.withdrawOnline(payload).then(async r => {
            // remove paymentTransaction from ongoingTransaction
            await this.transactionsService.removeFromOngoingTransactions(trxId);

            if(r.status == "success") {
                // change to property to NAIJASAVE to indicate that money actually goes directly to the company
                payload.to = "NAIJASAVE";

                // save transaction
                await this.transactionsService.addToSuccessfulTransactions(payload);

                // send sms
                await this.smsMediatorService.sendTransactionAlert(payload);
                return r;
            } else {
                throw r;
            }
        })
    }

    async depositOnline(payload: PaymentDto): Promise<IPaymentComplete> {
        // register payment in ongoingTransactions
        let trxId = await this.transactionsService.addToOngoingTransactions(payload);
        
        return await this.paymentService.depositOnline(payload).then(async r => {

            // remove paymentTransaction from ongoingTransaction
            await this.transactionsService.removeFromOngoingTransactions(trxId);
            
            if(r.status == "success") {
                // change to property to NAIJASAVE to indicate that money actually came directly from the company
                payload.from = "NAIJASAVE";

                // save transaction
                await this.transactionsService.addToSuccessfulTransactions(payload);

                if (payload.purpose === 'DailySavings') {
                    await this.tickDailySavingsPayment(payload)
                    await this.handleCommissionPayments({payload: payload})
                }

                // send sms
                await this.smsMediatorService.sendTransactionAlert(payload);
                return r;
            } else {
                throw r;
            }
        })
    }

    async payCommission(op: OverseerCommissionSummary) : Promise<OperationFeedback> {
        return this.paymentService.payCommission(op);
    }
 
    async credit(payload: PaymentDto): Promise<IPaymentComplete> {
        // register payment in ongoingTransactions
        let trxId = await this.transactionsService.addToOngoingTransactions(payload);

        // perform credit action
        return await this.paymentService.credit(payload).then( async (paymentComplete) => {
            // remove paymentTransaction from ongoingTransaction
            await this.transactionsService.removeFromOngoingTransactions(trxId);

            if(paymentComplete.status == "success") {
                await this.transactionsService.addToSuccessfulTransactions(payload);

                // update account for both parties
                await this.entitiesMediatorService.updateEntityAccount(
                    (<ITakeAmoutInFromAccountAndAddInToAccount>paymentComplete.paymentData).from, 
                    (<ITakeAmoutInFromAccountAndAddInToAccount>paymentComplete.paymentData).from.identity
                    );
                await this.entitiesMediatorService.updateEntityAccount(
                    (<ITakeAmoutInFromAccountAndAddInToAccount>paymentComplete.paymentData).to, 
                    (<ITakeAmoutInFromAccountAndAddInToAccount>paymentComplete.paymentData).to.identity
                    );

                // check and remove request if a request with the same payment id already exists
                await this.requestsService.deleteDepositRequest(payload._id);
                await this.requestsService.deleteWithdrawalRequest(payload._id);

                // send sms alert
                if(payload.send_sms_notification) {
                    await this.smsMediatorService.sendTransactionAlert(payload);
                }

                // update payment ticks & pay referral comission
                if(payload.purpose == "DailySavings") {
                    await this.tickDailySavingsPayment(payload);
                    await this.handleCommissionPayments({payload: payload})
                }
            } else {
                // write code to filter out the type of failed 
                // transactions to be added to failedTransactions collection
                // e.g Insufficient Balance
                await this.transactionsService.addToFailedTransactions(payload);
                throw new HttpException("Unable to perform transaction", HttpStatus.BAD_GATEWAY);
            }
            
            
            return paymentComplete;
        });
    }

    async debit(payload: PaymentDto): Promise<IPaymentComplete> {
        // register payment in ongoingTransactions
        let trxId = await this.transactionsService.addToOngoingTransactions(payload);
        if(payload.check) {
            return await this.debitWithChecks(trxId, payload);
        } else {
            return await this.debitWithoutChecks(trxId, payload); 
        }
    } 

    private async debitWithoutChecks(trxId: string, payload: PaymentDto): Promise<IPaymentComplete> {
        // perform credit action
        return await this.paymentService.debitWithoutChecks(payload).then( async (paymentComplete) => {
            // remove paymentTransaction from ongoingTransaction
            await this.transactionsService.removeFromOngoingTransactions(trxId);

            if(paymentComplete.status == "success") {
                await this.transactionsService.addToSuccessfulTransactions(payload);

                // update account for both parties
                await this.entitiesMediatorService.updateEntityAccount(
                    (<ITakeAmoutInFromAccountAndAddInToAccount>paymentComplete.paymentData).from, 
                    (<ITakeAmoutInFromAccountAndAddInToAccount>paymentComplete.paymentData).from.identity
                    );
                await this.entitiesMediatorService.updateEntityAccount(
                    (<ITakeAmoutInFromAccountAndAddInToAccount>paymentComplete.paymentData).to, 
                    (<ITakeAmoutInFromAccountAndAddInToAccount>paymentComplete.paymentData).to.identity
                    );

                
                // check and remove request if a request with the same payment id already exists
                await this.requestsService.deleteDepositRequest(payload._id);
                await this.requestsService.deleteWithdrawalRequest(payload._id);

                // send sms
                if(payload.send_sms_notification) {
                    await this.smsMediatorService.sendTransactionAlert(payload);
                }
            } else {
                // write code to filter out the type of failed 
                // transactions to be added to failedTransactions collection
                // e.g Insufficient Balance
                await this.transactionsService.addToFailedTransactions(payload);
                throw new HttpException("Unable to perform transaction", HttpStatus.BAD_GATEWAY);
            }
            
            return paymentComplete;
        });
    }

    private async debitWithChecks(trxId: string, payload: PaymentDto): Promise<IPaymentComplete> {
        // perform credit action
        return await this.paymentService.debitWithChecks(payload).then( async (paymentComplete) => {
            // remove paymentTransaction from ongoingTransaction
            await this.transactionsService.removeFromOngoingTransactions(trxId);

            if(paymentComplete.status == "success") {
                await this.transactionsService.addToSuccessfulTransactions(payload);

                // update account for both parties
                await this.entitiesMediatorService.updateEntityAccount(
                    (<ITakeAmoutInFromAccountAndAddInToAccount>paymentComplete.paymentData).from, 
                    (<ITakeAmoutInFromAccountAndAddInToAccount>paymentComplete.paymentData).from.identity
                    );
                await this.entitiesMediatorService.updateEntityAccount(
                    (<ITakeAmoutInFromAccountAndAddInToAccount>paymentComplete.paymentData).to, 
                    (<ITakeAmoutInFromAccountAndAddInToAccount>paymentComplete.paymentData).to.identity
                    );

                // check and remove request if a request with the same payment id already exists
                await this.requestsService.deleteDepositRequest(payload._id);
                await this.requestsService.deleteWithdrawalRequest(payload._id);

                // send sms
                if(payload.send_sms_notification) {
                    await this.smsMediatorService.sendTransactionAlert(payload);
                }

            } else {
                // write code to filter out the type of failed 
                // transactions to be added to failedTransactions collection
                // e.g Insufficient Balance
                await this.transactionsService.addToFailedTransactions(payload)
                throw new HttpException("Unable to perform transaction", HttpStatus.BAD_GATEWAY);
            }
            
            return paymentComplete;
        });
    }

    // trading balance stuff
    async fundAdminAccount(payload: TradingBalanceTransactionPayload): Promise<OperationFeedback> {
        return await this.paymentService.fundAdminAccount(payload)
    }

    async debitAdminAccount(payload: TradingBalanceTransactionPayload): Promise<OperationFeedback> {
        return await this.paymentService.debitAdminAccount(payload);
    }

    async updateTradingBalance(payload: TradingBalanceTransactionPayload): Promise<OperationFeedback> {
        return await this.paymentService.updateTradingBalance(payload);
    }

    private async tickDailySavingsPayment(payload: PaymentDto) {
        // Tick payment
        let date = new Date(payload.date);
        await this.paymentTicksService.tick(
            payload.to,
            payload._id,
            {
                year: date.getFullYear(),
                month: date.getMonth(),
                day: date.getDate()
            }
        );
    }

    private async handleCommissionPayments(op: {payload: PaymentDto}) {
        // first deposit commission charge
        await this.commissionService.chargeFirstPaymentComission({contributorId : op.payload.to, paymentMethod: op.payload.method});
                    
        // monthly commission
        await this.commissionService.chargeMonthlyCommission({contributorId : op.payload.to});

        // pay referral commission to beneficiary
        this.referralService.payReferralCommission({contributorId : op.payload.to, amount : 50});
    }

}
 