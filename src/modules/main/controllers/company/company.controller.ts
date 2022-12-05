import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { CompanyDto, CompanySettingsModel } from 'src/modules/shared/dto/company/company-dto';
import { NewCompanyDataDto } from 'src/modules/shared/dto/new-company-data/new-company-data-dto';
import { AuthenticatedGuard } from 'src/modules/shared/guards/authenticated/authenticated.guard';
import { CompanyGuard } from 'src/modules/shared/guards/company/company.guard';
import { OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { CommissionService } from 'src/modules/shared/services/commission/commission/commission.service';
import { CompanyService } from 'src/modules/shared/services/company/company.service';

@Controller('company')
@UseGuards(AuthenticatedGuard, CompanyGuard)
export class CompanyController {
    constructor(
        private companyService: CompanyService,
        private commissionService: CommissionService
    ) {}

    @Post()
    async getCompanyData(@Body() password: {password: string}): Promise<CompanyDto> {
        return await this.companyService.getCompanyData(password.password);
    }

    @Get('compute-commission')
    async computeCommission(): Promise<boolean> {
        return true;
        // chargeMonthlyCommission
        // return this.commissionService.chargeContributorsMonthlyCommissions().then(r => {
        //    return true; 
        // })
        
    }
    
    @Post('new_company_data')
    async newCompanyData(
        @Body() new_data: NewCompanyDataDto
    ): Promise<OperationFeedback> {
        return await this.companyService.newCompanyData(new_data);
    }

    @Put('change_company_settings')
    async changeCompanySettings(
        @Body() modified_settings: CompanySettingsModel
    ): Promise<OperationFeedback> {
        return await this.companyService.changeCompanySettings(modified_settings);
    }
}
