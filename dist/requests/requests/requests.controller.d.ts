import { DepositRequestDto } from 'src/modules/shared/dto/deposit-request/deposit-request-dto';
import { SignupRequestDto } from 'src/modules/shared/dto/signup-request/signup-request-dto';
import { WithdrawalRequestDto } from 'src/modules/shared/dto/withdrawal-request/withdrawal-request-dto';
import { OperationFeedback, RequestsCountResponse } from 'src/modules/shared/interface/shared-interfaces';
import { EntitiesMediatorService } from 'src/modules/shared/services/entities-mediator/entities-mediator/entities-mediator.service';
import { QualificationService } from 'src/modules/shared/services/qualification/qualification.service';
import { RequestsService } from 'src/modules/shared/services/requests/requests.service';
export declare class RequestsController {
    private requestsService;
    private entitiesMediatorService;
    private qualificationService;
    constructor(requestsService: RequestsService, entitiesMediatorService: EntitiesMediatorService, qualificationService: QualificationService);
    countRequests(overseer_id: string): Promise<RequestsCountResponse>;
    fetchSignupRequest(id: string): Promise<SignupRequestDto | SignupRequestDto[]>;
    insertSignupRequest(req: SignupRequestDto): Promise<void>;
    deleteSignupRequest(admin_id: string, id: string): Promise<void>;
    updateSignupRequest(admin_id: string, id: string, should_update: boolean, update: SignupRequestDto): Promise<void>;
    forwardDepositRequestToOverseer(request_id: string, overseer_id: string): Promise<OperationFeedback>;
    forwardWithdrawalRequestToOverseer(request_id: string, overseer_id: string): Promise<OperationFeedback>;
    insertDepositRequest(request: DepositRequestDto): Promise<{
        success: boolean;
    }>;
    deleteDepositRequest(request_id: string): Promise<void>;
    deleteWithdrawalRequest(request_id: string): Promise<void>;
    fetchDepositRequests(overseer_id: string): Promise<Array<DepositRequestDto>>;
    insertWithdrawalRequest(request: WithdrawalRequestDto): Promise<{
        success: boolean;
    }>;
    fetchWithdrawalRequests(overseer_id: string): Promise<WithdrawalRequestDto[]>;
}
