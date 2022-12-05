import { Body, Controller, HttpException, HttpStatus, NotFoundException, Post, UseGuards } from '@nestjs/common';
import { PaymentDto } from 'src/modules/shared/dto/payment/payment-dto';
import { OverseerCommissionSummary } from 'src/modules/shared/dto/transaction/transaction-dto';
import { AuthenticatedGuard } from 'src/modules/shared/guards/authenticated/authenticated.guard';
import { HeadAdminGuard } from 'src/modules/shared/guards/head-admin/head-admin.guard';
import { OperationFeedback, TradingBalanceTransactionPayload } from 'src/modules/shared/interface/shared-interfaces';
import { EntitiesMediatorService } from 'src/modules/shared/services/entities-mediator/entities-mediator/entities-mediator.service';
import { PaymentMediatorService } from 'src/modules/shared/services/payment-mediator/payment-mediator.service';
import { PaymentService } from 'src/modules/shared/services/payment/payment.service';

@Controller('payment')
@UseGuards(AuthenticatedGuard)
export class PaymentController {
    constructor(
        private paymentMediatorService: PaymentMediatorService,
        private entitiesMediatorService: EntitiesMediatorService
        ) {}

    @Post('online-deposit')
    async depositOnline(@Body() payload: PaymentDto): Promise<OperationFeedback> {
        await this.checkRequiredPaymentData(payload);

        return await this.paymentMediatorService.depositOnline(payload).then(r => {
            if (r.status == 'success') {
                return {success: true, message: r.message}
            } else {
                throw new HttpException(r.message, HttpStatus.BAD_REQUEST)
            }
        })
    }

    @Post('online-withdrawal')
    @UseGuards(HeadAdminGuard)
    async withdrawOnline(@Body() payload: PaymentDto): Promise<OperationFeedback> {
        await this.checkRequiredPaymentData(payload);

        return await this.paymentMediatorService.withdrawOnline(payload).then(r => {
            if (r.status == 'success') {
                return {success: true, message: r.message}
            } else {
                throw new HttpException(r.message, HttpStatus.BAD_REQUEST)
            }
        })
    }

    @Post('credit')
    async credit(@Body() payload: PaymentDto): Promise<OperationFeedback> {
        await this.checkRequiredPaymentData(payload);

        return await this.paymentMediatorService.credit(payload).then(paymentComplete => {
            if(paymentComplete.status != "success") {
                throw new HttpException(paymentComplete.message, HttpStatus.BAD_GATEWAY);
            } else {
                return {success: true, message: paymentComplete.message};
            }
        })
    }

    @Post('debit')
    async debit(@Body() payload: PaymentDto): Promise<OperationFeedback> {
        await this.checkRequiredPaymentData(payload);
        await this.checkRequiredPaymentDataSpecificToDebits(payload)

        return await this.paymentMediatorService.debit(payload).then(paymentComplete => {
            if(paymentComplete.status != "success") {
                throw new HttpException(paymentComplete.message, HttpStatus.BAD_GATEWAY);
            } else {
                return {success: true, message: paymentComplete.message};
            }
        })
    }

    @Post('pay-overseer-commission')
    async payOverseerCommission(@Body() payload: OverseerCommissionSummary): Promise<OperationFeedback> {
        return await this.paymentMediatorService.payCommission(payload);
    }

    @Post('fund-admin')
    async debitTradingBalance(@Body() payload: TradingBalanceTransactionPayload): Promise<OperationFeedback> {
        return await this.paymentMediatorService.fundAdminAccount(payload);
    }

    @Post('debit-admin')
    async creditTradingBalance(@Body() payload: TradingBalanceTransactionPayload): Promise<OperationFeedback> {
        return await this.paymentMediatorService.debitAdminAccount(payload);
    }

    @Post('update-trading-balance')
    private async updateTradingBalance(@Body() payload: TradingBalanceTransactionPayload) : Promise<OperationFeedback> {
        return await this.paymentMediatorService.updateTradingBalance(payload);
    }

    private async checkRequiredPaymentData(payload: PaymentDto) {
        // check for any missing property in the payload
        if(!payload.from) {
            throw new HttpException("No source account id provided", HttpStatus.EXPECTATION_FAILED);
        }
        if(!payload.to) {
            throw new HttpException("No destination account id provided", HttpStatus.EXPECTATION_FAILED);
        }

        if(!payload.amount) {
            throw new HttpException("No amount provided", HttpStatus.EXPECTATION_FAILED);
        }

        if(isNaN(payload.amount)) {
            throw new HttpException("Unacceptable amount provided", HttpStatus.EXPECTATION_FAILED);
        }

        if(!payload.method) {
            throw new HttpException("No payment method provided", HttpStatus.EXPECTATION_FAILED);
        }

        // check the existence of the source and destination entities
        if(!(await this.entitiesMediatorService.exists(payload.from))) {
            throw new NotFoundException(`Source entity with id ${payload.from} not found`);
        }
        if(!(await this.entitiesMediatorService.exists(payload.to))) {
            throw new NotFoundException(`Sestination entity with id ${payload.to} not found`);
        }
    }

    private async checkRequiredPaymentDataSpecificToDebits(payload: PaymentDto) {
        // check for any missing property in the payload
        //if(!payload.check) {
        //    throw new HttpException("Expecting a check property. None or inappropriate value provided", HttpStatus.EXPECTATION_FAILED);
        //}
    }
}
