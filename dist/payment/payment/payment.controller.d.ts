import { PaymentDto } from 'src/modules/shared/dto/payment/payment-dto';
import { OverseerCommissionSummary } from 'src/modules/shared/dto/transaction/transaction-dto';
import { OperationFeedback, TradingBalanceTransactionPayload } from 'src/modules/shared/interface/shared-interfaces';
import { EntitiesMediatorService } from 'src/modules/shared/services/entities-mediator/entities-mediator/entities-mediator.service';
import { PaymentMediatorService } from 'src/modules/shared/services/payment-mediator/payment-mediator.service';
export declare class PaymentController {
    private paymentMediatorService;
    private entitiesMediatorService;
    constructor(paymentMediatorService: PaymentMediatorService, entitiesMediatorService: EntitiesMediatorService);
    credit(payload: PaymentDto): Promise<OperationFeedback>;
    debit(payload: PaymentDto): Promise<OperationFeedback>;
    payOverseerCommission(payload: OverseerCommissionSummary): Promise<OperationFeedback>;
    debitTradingBalance(payload: TradingBalanceTransactionPayload): Promise<OperationFeedback>;
    creditTradingBalance(payload: TradingBalanceTransactionPayload): Promise<OperationFeedback>;
    private updateTradingBalance;
    private checkRequiredPaymentData;
    private checkRequiredPaymentDataSpecificToDebits;
}
