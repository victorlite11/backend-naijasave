import { AuthDto } from 'src/modules/shared/dto/auth/auth-dto';
import { IAuthResult } from 'src/modules/shared/interface/shared-interfaces';
import { DbMediatorService } from '../db-mediator/db-mediator.service';
import { SmsMediatorService } from '../sms-mediator/sms-mediator/sms-mediator.service';
export declare class AuthService {
    private dbMediatorService;
    private smsMediatorService;
    constructor(dbMediatorService: DbMediatorService, smsMediatorService: SmsMediatorService);
    authenticateAdmin(credential: AuthDto): Promise<IAuthResult>;
    private checkAndUseAdminLoginDetails;
    private authenticateAdminWithLoginCredentials;
    authenticateContributor(credential: AuthDto): Promise<IAuthResult>;
    private checkAndUseContributorLoginDetails;
    private tokenIsExpired;
    private authenticateContributorWithLoginCredentials;
}
