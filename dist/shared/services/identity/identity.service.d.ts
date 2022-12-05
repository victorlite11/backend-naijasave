import { AdminIdentityModel } from 'src/shared/dto/admin/admin-dto';
import { IdentityModel } from 'src/shared/dto/contributor/contributor-dto';
import { DbMediatorService } from '../db-mediator/db-mediator.service';
import { PrivilegeService } from '../privilege/privilege.service';
export declare class IdentityService {
    private dbMediatorService;
    private privilegeService;
    constructor(dbMediatorService: DbMediatorService, privilegeService: PrivilegeService);
    fetchContributorIdentity(contributor_id: string): Promise<IdentityModel>;
    fetchAdminIdentity(admin_id: string): Promise<AdminIdentityModel>;
    changeAdminIdentity(admin_id: string, interested_identity: {
        interested_identity: "super" | "sub" | "head";
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    private constructAdminUsername;
    changeContributorIdentity(contributor_id: string, interested_identity: {
        interested_identity: "super" | "sub" | "investor" | "contributor";
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    makeHeadAdmin(identity: AdminIdentityModel): AdminIdentityModel;
    makeSuperAdmin(identity: AdminIdentityModel): AdminIdentityModel;
    makeSubAdmin(identity: AdminIdentityModel): AdminIdentityModel;
    makeFeebleAdmin(identity: AdminIdentityModel): AdminIdentityModel;
    makeInvestor(identity: IdentityModel): IdentityModel;
    makeContributor(identity: IdentityModel): IdentityModel;
    makeSuperContributor(identity: IdentityModel): IdentityModel;
    makeSubContributor(identity: IdentityModel): IdentityModel;
    revokePrivilege(identity: IdentityModel): IdentityModel;
    private turnOffNormalIdentities;
    private createUniqueIdentityFrom;
}
