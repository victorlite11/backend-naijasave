import { DepositRequestDto } from 'src/shared/dto/deposit-request/deposit-request-dto';
import { PaymentDto } from 'src/shared/dto/payment/payment-dto';
import { SignupRequestDto } from 'src/shared/dto/signup-request/signup-request-dto';
import { WithdrawalRequestDto } from 'src/shared/dto/withdrawal-request/withdrawal-request-dto';
import { OperationFeedback, SMSProforma } from 'src/shared/interface/shared-interfaces';
import { DbMediatorService } from '../../db-mediator/db-mediator.service';
import { EntitiesMediatorService } from '../../entities-mediator/entities-mediator/entities-mediator.service';
export declare class SmsMediatorService {
    private vonage_api_key;
    private vonage_api_secret;
    private dbMediatorService;
    private entitiesMediatorService;
    private sender;
    private multiTexterUrl;
    private vonage;
    constructor(vonage_api_key: string, vonage_api_secret: string, dbMediatorService: DbMediatorService, entitiesMediatorService: EntitiesMediatorService);
    sendDepositRequestSms(request: DepositRequestDto): Promise<void>;
    sendWithdrawalRequestSms(request: WithdrawalRequestDto): Promise<void>;
    sendSignupRequestApprovalSMS(signupRequest: SignupRequestDto): Promise<void>;
    sendTransactionAlert(payload: PaymentDto): Promise<void>;
    messageRecipients(payload: {
        message: string;
        recipients: Array<string>;
    }): Promise<OperationFeedback>;
    sendAccountChangeSMS(recipient_id: string, sms_proforma: SMSProforma): Promise<void>;
    private formatMessage;
    private fillPlaceholdersInMessage;
    private sendSMS;
}
