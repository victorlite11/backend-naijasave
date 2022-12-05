import { AdminPrivilegeModel } from 'src/modules/shared/dto/admin/admin-dto';
import { PrivilegeModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { PrivilegeService } from 'src/modules/shared/services/privilege/privilege.service';
export declare class PrivilegeController {
    private privilegeService;
    constructor(privilegeService: PrivilegeService);
    fetchContributorPrivilege(contributor_id: string): Promise<PrivilegeModel>;
    fetchAdminPrivilege(admin_id: string): Promise<AdminPrivilegeModel>;
    changeContributorPrivilege(contributor_id: string, modified_privilege: PrivilegeModel): Promise<OperationFeedback>;
    changeAdminPrivilege(admin_id: string, modified_privilege: AdminPrivilegeModel): Promise<OperationFeedback>;
}
