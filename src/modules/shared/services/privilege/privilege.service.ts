import { Injectable } from '@nestjs/common';
import { AdminPrivilegeModel } from 'src/modules/shared/dto/admin/admin-dto';
import { PrivilegeModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { DbMediatorService } from '../db-mediator/db-mediator.service';

@Injectable()
export class PrivilegeService {
    constructor(
        private dbMediatorService: DbMediatorService
    ) {}




    async fetchContributorPrivilege(contributor_id: string): Promise<PrivilegeModel> {
        return await this.dbMediatorService.fetchContributorPrivilege(contributor_id);
    }

    async fetchAdminPrivilege(admin_id: string): Promise<AdminPrivilegeModel> {
        return await (await this.dbMediatorService.fetchAdmin({_id: admin_id})).privilege;
    }

    async changeAdminPrivilege(admin_id: string, modified_privilege: AdminPrivilegeModel): Promise<OperationFeedback> {

        return await this.dbMediatorService.updateAdmin(
            {_id: admin_id},
            {$set: {"privilege": modified_privilege}}
        )
    }

    async changeContributorPrivilege(contributor_id: string, modified_privilege: PrivilegeModel): Promise<OperationFeedback> {

        return await this.dbMediatorService.updateContributor(
            {_id: contributor_id},
            {$set: {"privilege": modified_privilege}}
        )
    }
 

    newAdminPrivilege(identity: "super" | "sub" | "head"): AdminPrivilegeModel {
        let newPrivilege = new AdminPrivilegeModel();

        switch(identity) {
            case "head":
                newPrivilege.canAcceptContributorsRequests = true;
                newPrivilege.canAcceptDepositRequests = true;
                newPrivilege.canAcceptSignupRequests = true;
                newPrivilege.canAcceptWithdrawalRequests = true;
                newPrivilege.canCreateAccountForContributors = true;
                newPrivilege.canCreditOthers = true;
                newPrivilege.canCreditTradingBalance = true;
                newPrivilege.canDebitOthersWithChecks = true;
                newPrivilege.canDebitOthersWithoutChecks = true;
                newPrivilege.canDebitTradingBalance = true;
                newPrivilege.canDepositSelf = true;
                newPrivilege.canEditSignupRequestData = true;
                newPrivilege.canMakeContributorsSuperOrSub = true;
                newPrivilege.canPlaceDepositRequest = true;
                newPrivilege.canPlaceWithdrawalRequest = true;
                newPrivilege.canRejectContributorsRequests = true;
                newPrivilege.canRemoveContributors = true;
                newPrivilege.canSeeCompanyProfile = true;
                newPrivilege.canWithdrawSelf = true;
                break;
            case "super":
                newPrivilege.canAcceptContributorsRequests = true;
                newPrivilege.canAcceptDepositRequests = true;
                newPrivilege.canAcceptSignupRequests = true;
                newPrivilege.canAcceptWithdrawalRequests = true;
                newPrivilege.canCreateAccountForContributors = true;
                newPrivilege.canCreditOthers = true;
                newPrivilege.canCreditTradingBalance = false;
                newPrivilege.canDebitOthersWithChecks = true;
                newPrivilege.canDebitOthersWithoutChecks = true;
                newPrivilege.canDebitTradingBalance = false;
                newPrivilege.canDepositSelf = true;
                newPrivilege.canEditSignupRequestData = true;
                newPrivilege.canMakeContributorsSuperOrSub = true;
                newPrivilege.canPlaceDepositRequest = true;
                newPrivilege.canPlaceWithdrawalRequest = true;
                newPrivilege.canRejectContributorsRequests = true;
                newPrivilege.canRemoveContributors = true;
                newPrivilege.canSeeCompanyProfile = false;
                newPrivilege.canWithdrawSelf = true;
                break;
            case "sub":
                newPrivilege.canAcceptContributorsRequests = true;
                newPrivilege.canAcceptDepositRequests = true;
                newPrivilege.canAcceptSignupRequests = true;
                newPrivilege.canAcceptWithdrawalRequests = true;
                newPrivilege.canCreateAccountForContributors = true;
                newPrivilege.canCreditOthers = true;
                newPrivilege.canCreditTradingBalance = false;
                newPrivilege.canDebitOthersWithChecks = true;
                newPrivilege.canDebitOthersWithoutChecks = false;
                newPrivilege.canDebitTradingBalance = false;
                newPrivilege.canDepositSelf = true;
                newPrivilege.canEditSignupRequestData = false;
                newPrivilege.canMakeContributorsSuperOrSub = true;
                newPrivilege.canPlaceDepositRequest = true;
                newPrivilege.canPlaceWithdrawalRequest = true;
                newPrivilege.canRejectContributorsRequests = false;
                newPrivilege.canRemoveContributors = false;
                newPrivilege.canSeeCompanyProfile = false;
                newPrivilege.canWithdrawSelf = true;
                break;
            default:
                break;
        }

        return newPrivilege;
    }





    // legacy codes 
    toggleContributorDepositingAnyAmountAbility(privilege: PrivilegeModel): PrivilegeModel {
        // create new object from privilege to avoid mutation
        privilege = this.createUniquePrivilegeFrom(privilege);

        privilege.canDepositAnyAmount = privilege.canDepositAnyAmount ? false : true;

        return privilege;
    }

    toggleContributorChangingDailyDepositAbility(privilege: PrivilegeModel): PrivilegeModel {
        // create new object from privilege to avoid mutation
        privilege = this.createUniquePrivilegeFrom(privilege);

        privilege.canChangeDailyDeposit = privilege.canChangeDailyDeposit ? false : true;

        return privilege;
    }

    toggleContributorOpeningAccountForSubordinatesAbility(privilege: PrivilegeModel): PrivilegeModel {
        // create new object from privilege to avoid mutation
        privilege = this.createUniquePrivilegeFrom(privilege);

        privilege.canOpenAccountForSubordinates = privilege.canOpenAccountForSubordinates ? false : true;

        return privilege;
    }

    toggleContributorDepositingSubordinatesAbility(privilege: PrivilegeModel): PrivilegeModel {
        // create new object from privilege to avoid mutation
        privilege = this.createUniquePrivilegeFrom(privilege);

        privilege.canDepositSubordinates = privilege.canDepositSubordinates ? false : true;

        return privilege;
    }

    toggleContributorWithdrawingSubordinatesAbility(privilege: PrivilegeModel): PrivilegeModel {
        // create new object from privilege to avoid mutation
        privilege = this.createUniquePrivilegeFrom(privilege);

        privilege.canWithdrawSubordinates = privilege.canWithdrawSubordinates ? false : true;

        return privilege;
    }

    toggleContributorDepositingAbility(privilege: PrivilegeModel): PrivilegeModel {
        // create new object from privilege to avoid mutation
        privilege = this.createUniquePrivilegeFrom(privilege);

        privilege.canDeposit = privilege.canDeposit ? false : true;

        return privilege;
    }

    toggleContributorWithdrawalAbility(privilege: PrivilegeModel): PrivilegeModel {
        // create new object from privilege to avoid mutation
        privilege = this.createUniquePrivilegeFrom(privilege);

        privilege.canWithdraw = privilege.canWithdraw ? false : true;

        return privilege;
    }

    toggleContributorWithdrawingWhileImmatureAbility(privilege: PrivilegeModel): PrivilegeModel {
        // create new object from privilege to avoid mutation
        privilege = this.createUniquePrivilegeFrom(privilege);

        privilege.canWithdrawWhileImmature = privilege.canWithdrawWhileImmature ? false : true;

        return privilege;
    }

    private createUniquePrivilegeFrom(privilege: PrivilegeModel): PrivilegeModel {
        return {...privilege};
    }
}
