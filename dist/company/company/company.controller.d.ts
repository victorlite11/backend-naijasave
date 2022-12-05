import { CompanyDto, CompanySettingsModel } from 'src/modules/shared/dto/company/company-dto';
import { NewCompanyDataDto } from 'src/modules/shared/dto/new-company-data/new-company-data-dto';
import { OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { CommissionService } from 'src/modules/shared/services/commission/commission/commission.service';
import { CompanyService } from 'src/modules/shared/services/company/company.service';
export declare class CompanyController {
    private companyService;
    private commissionService;
    constructor(companyService: CompanyService, commissionService: CommissionService);
    getCompanyData(password: {
        password: string;
    }): Promise<CompanyDto>;
    computeCommission(): Promise<boolean>;
    newCompanyData(new_data: NewCompanyDataDto): Promise<OperationFeedback>;
    changeCompanySettings(modified_settings: CompanySettingsModel): Promise<OperationFeedback>;
}
