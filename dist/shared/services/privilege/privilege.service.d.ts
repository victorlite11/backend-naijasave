import { AdminPrivilegeModel } from 'src/shared/dto/admin/admin-dto';
import { PrivilegeModel } from 'src/shared/dto/contributor/contributor-dto';
import { OperationFeedback } from 'src/shared/interface/shared-interfaces';
import { DbMediatorService } from '../db-mediator/db-mediator.service';
export declare class PrivilegeService {
    private dbMediatorService;
    constructor(dbMediatorService: DbMediatorService);
    fetchContributorPrivilege(contributor_id: string): Promise<PrivilegeModel>;
    fetchAdminPrivilege(admin_id: string): Promise<AdminPrivilegeModel>;
    changeAdminPrivilege(admin_id: string, modified_privilege: AdminPrivilegeModel): Promise<OperationFeedback>;
    changeContributorPrivilege(contributor_id: string, modified_privilege: PrivilegeModel): Promise<OperationFeedback>;
    newAdminPrivilege(identity: "super" | "sub" | "head"): AdminPrivilegeModel;
    toggleContributorDepositingAnyAmountAbility(privilege: PrivilegeModel): PrivilegeModel;
    toggleContributorChangingDailyDepositAbility(privilege: PrivilegeModel): PrivilegeModel;
    toggleContributorOpeningAccountForSubordinatesAbility(privilege: PrivilegeModel): PrivilegeModel;
    toggleContributorDepositingSubordinatesAbility(privilege: PrivilegeModel): PrivilegeModel;
    toggleContributorWithdrawingSubordinatesAbility(privilege: PrivilegeModel): PrivilegeModel;
    toggleContributorDepositingAbility(privilege: PrivilegeModel): PrivilegeModel;
    toggleContributorWithdrawalAbility(privilege: PrivilegeModel): PrivilegeModel;
    toggleContributorWithdrawingWhileImmatureAbility(privilege: PrivilegeModel): PrivilegeModel;
    private createUniquePrivilegeFrom;
}
