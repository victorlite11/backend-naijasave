import { CompanyDto, CompanySettingsModel } from 'src/shared/dto/company/company-dto';
import { NewCompanyDataDto } from 'src/shared/dto/new-company-data/new-company-data-dto';
import { OperationFeedback } from 'src/shared/interface/shared-interfaces';
import { AdminService } from '../admin/admin.service';
import { DbMediatorService } from '../db-mediator/db-mediator.service';
export declare class CompanyService {
    private dbMediatorService;
    private adminService;
    constructor(dbMediatorService: DbMediatorService, adminService: AdminService);
    newCompanyData(new_data: NewCompanyDataDto): Promise<OperationFeedback>;
    getCompanyData(password: string): Promise<CompanyDto>;
    getCompanyDataWithoutPassword(): Promise<CompanyDto>;
    changeCompanySettings(modified_settings: CompanySettingsModel): Promise<OperationFeedback>;
}
