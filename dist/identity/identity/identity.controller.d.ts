import { AdminIdentityModel } from 'src/modules/shared/dto/admin/admin-dto';
import { IdentityModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { IdentityService } from 'src/modules/shared/services/identity/identity.service';
export declare class IdentityController {
    private identityService;
    constructor(identityService: IdentityService);
    fetchContributorPrivilege(contributor_id: string): Promise<IdentityModel>;
    fetchAdminPrivilege(admin_id: string): Promise<AdminIdentityModel>;
    changeContributorPrivilege(contributor_id: string, interested_identity: {
        interested_identity: "super" | "sub" | "investor" | "contributor";
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    changeAdminPrivilege(admin_id: string, interested_identity: {
        interested_identity: "super" | "sub" | "head";
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
