import { AdminAccountModel, AdminPrivilegeModel } from 'src/shared/dto/admin/admin-dto';
import { AccountModel, PrivilegeModel } from 'src/shared/dto/contributor/contributor-dto';
import { EntityIdentity } from 'src/shared/interface/shared-interfaces';
import { DbMediatorService } from '../db-mediator/db-mediator.service';
export declare class QualificationService {
    private dbMediatorService;
    constructor(dbMediatorService: DbMediatorService);
    hasEnoughBalance(amount: number, account: AdminAccountModel | AccountModel): Promise<void>;
    canCreditOthers(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel): Promise<void>;
    canDebitOthersWithoutChecks(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel): Promise<void>;
    canDebitOthersWithChecks(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel): Promise<void>;
    canWithdraw(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel): Promise<void>;
    canDeposit(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel): Promise<void>;
    canMakeWithdrawalRequest(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel): Promise<void>;
    canUseSMS(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel): Promise<void>;
    canMakeDepositRequest(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel): Promise<void>;
    canEditSignupRequest(privilege: AdminPrivilegeModel): Promise<void>;
    canChangeContributorOversser(privilege: AdminPrivilegeModel): Promise<void>;
    canRemoveContributors(privilege: AdminPrivilegeModel): Promise<void>;
    canWithdrawWhileAccountIsImmature(approvalDate: string, maturityDays: string, privilege: PrivilegeModel): Promise<void>;
    accountIsMartured(contributorApprovalDate: string, maturityDays: string): Promise<void>;
    canDepositAnyAmount(amount: number, dailySavings: number, privilege: PrivilegeModel): Promise<void>;
    amountEqualsDailySavings(amount: number, dailySavings: number): Promise<void>;
    canRejectSubordinatesRequests(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel): Promise<void>;
    canAcceptSubordinatesRequests(entity: EntityIdentity, privilege: AdminPrivilegeModel | PrivilegeModel): Promise<void>;
    alreadyRegistered(phoneNumber?: string, email?: string): Promise<void>;
    awaitingApproval(phoneNumber?: string, email?: string): Promise<void>;
}
