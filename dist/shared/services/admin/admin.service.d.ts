import { FilterQuery } from 'mongodb';
import { AdminDto, AdminAccountModel } from 'src/shared/dto/admin/admin-dto';
import { NewAdminDto } from 'src/shared/dto/new-admin/new-admin-dto';
import { IRegisterActionRequest, OperationFeedback } from 'src/shared/interface/shared-interfaces';
import { AccountingService } from 'src/shared/services/accounting/accounting.service';
import { IdentityService } from 'src/shared/services/identity/identity.service';
import { PrivilegeService } from 'src/shared/services/privilege/privilege.service';
import { QualificationService } from 'src/shared/services/qualification/qualification.service';
import { DbMediatorService } from '../db-mediator/db-mediator.service';
export declare class AdminService {
    private dbMediatorService;
    private identityService;
    private accountingService;
    private privilegeService;
    private qualificationService;
    constructor(dbMediatorService: DbMediatorService, identityService: IdentityService, accountingService: AccountingService, privilegeService: PrivilegeService, qualificationService: QualificationService);
    fetchAdmin(id: string): Promise<AdminDto>;
    fetchAdmins(query: FilterQuery<AdminDto>): Promise<AdminDto[]>;
    registerAdminAction(payload: IRegisterActionRequest): Promise<void>;
    updateAdminAccount(payload: {
        _id: string;
        account: AdminAccountModel;
    }): Promise<void>;
    createAdmin(payload: NewAdminDto): Promise<OperationFeedback>;
    getHeadAdmin(): Promise<AdminDto>;
    private constructAdminUsername;
    private assignIdentity;
}
