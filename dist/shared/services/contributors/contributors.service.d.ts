import { BasicContributorOverseerModel } from 'src/modules/shared/dto/basic-contributor/basic-contributor-dto';
import { SignupRequestDto } from 'src/modules/shared/dto/signup-request/signup-request-dto';
import { IFetchContributorsQueries, SMSProforma, IRegisterActionRequest, OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { AccountingService } from 'src/modules/shared/services/accounting/accounting.service';
import { CompanyService } from 'src/modules/shared/services/company/company.service';
import { IdentityService } from 'src/modules/shared/services/identity/identity.service';
import { PrivilegeService } from 'src/modules/shared/services/privilege/privilege.service';
import { SmsMediatorService } from 'src/modules/shared/services/sms-mediator/sms-mediator/sms-mediator.service';
import { ContributorDto, AccountModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { DbMediatorService } from '../db-mediator/db-mediator.service';
import { AdminService } from '../admin/admin.service';
export declare class ContributorsService {
    private identityService;
    private privilegeService;
    private accountingService;
    private dbMediatorService;
    private companyService;
    private adminsService;
    private smsMediatorService;
    constructor(identityService: IdentityService, privilegeService: PrivilegeService, accountingService: AccountingService, dbMediatorService: DbMediatorService, companyService: CompanyService, adminsService: AdminService, smsMediatorService: SmsMediatorService);
    fetchContributors(queries: IFetchContributorsQueries): Promise<Array<ContributorDto>>;
    fetchContributor(id: string): Promise<ContributorDto>;
    getContributorOverseer(contributor_id: string): Promise<BasicContributorOverseerModel>;
    changeUsername(id: string, username: string, sms?: SMSProforma): Promise<boolean>;
    changeOverseerIds(): Promise<void>;
    changeOverseer(contributor_id: string, new_overseer_id: string): Promise<OperationFeedback>;
    deleteContributor(id: string): Promise<boolean>;
    registerContributorAction(payload: IRegisterActionRequest): Promise<void>;
    updateContributorAccount(payload: {
        _id: string;
        account: AccountModel;
    }): Promise<void>;
    createNewContributor(signupRequest: SignupRequestDto): Promise<void>;
    updateDatabase(): Promise<number>;
    private setBasicInfo;
    private setCredentials;
    private setLocation;
    private defineActivities;
}
