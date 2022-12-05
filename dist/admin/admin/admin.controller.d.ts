import { AdminDto } from 'src/modules/shared/dto/admin/admin-dto';
import { NewAdminDto } from 'src/modules/shared/dto/new-admin/new-admin-dto';
import { OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { AdminService } from 'src/modules/shared/services/admin/admin.service';
import { GeneralService } from 'src/modules/shared/services/general/general/general.service';
export declare class AdminController {
    private adminService;
    private generalService;
    constructor(adminService: AdminService, generalService: GeneralService);
    createNewAdmin(payload: NewAdminDto): Promise<OperationFeedback>;
    fetchSelfData(req: any): Promise<AdminDto>;
    fetchAdmins(): Promise<AdminDto[]>;
    fetchAdmin(id: string, req: any): Promise<AdminDto>;
}
