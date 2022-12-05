import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CompanyDto, CompanySettingsModel } from 'src/modules/shared/dto/company/company-dto';
import { ContributorDto } from 'src/modules/shared/dto/contributor/contributor-dto';
import { NewCompanyDataDto } from 'src/modules/shared/dto/new-company-data/new-company-data-dto';
import { IdGenerator } from 'src/modules/shared/helpers/id-generator/id-generator';
import { OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { AdminService } from '../admin/admin.service';
import { DbMediatorService } from '../db-mediator/db-mediator.service';

@Injectable()
export class CompanyService {
    constructor(
        private dbMediatorService: DbMediatorService,
        private adminService: AdminService
    ) {}

    async newCompanyData(
        new_data: NewCompanyDataDto
    ): Promise<OperationFeedback> {

        // no more than one data can exist
        let companyData = await this.dbMediatorService.fetchCompanyData({});

        if(companyData) {
            throw new HttpException("Company Data already exists", HttpStatus.BAD_REQUEST);
        }

        // only headAdmin can update company data
        let admin = await this.adminService.fetchAdmin(new_data.admin_id);
        if(!new_data.admin_id || !admin || !admin.identity.isHeadAdmin) {
            throw new HttpException("Only HEAD ADMIN can create company data", HttpStatus.BAD_REQUEST); 
        }

        // create company
        let company = new CompanyDto();
        // update basic data
        company._id = `${new_data.name.toLowerCase()}` + IdGenerator.generateKey(30);
        if(new_data.starting_trading_balance) {
            // cannot accept invalid number
            if(isNaN(Number(new_data.starting_trading_balance))) {
                throw new HttpException("Invalid amount provide", HttpStatus.BAD_REQUEST); 
            }

            company.account.tradingBalance = new_data.starting_trading_balance;
            company.account.availableTradingBalance = new_data.starting_trading_balance;
        }

        company.basicInformation.name = new_data.name;
        company.basicInformation.dateCreated = new Date().toISOString();
        company.credentials.password = IdGenerator.generateKey(5);
        company.referral.earningPerReferral = 50;
        company.referral.minimumWithdrawable = 500;

        company.settings.contributorAccountMaturityCriteria = {
            amount: {
                use: false, amount: 2000
            },
            days: 18
        };

        company.settings.depositChangeAbleDays = {from: 1, to: 10};
        company.settings.inactiveTolerance = 10;

        await this.dbMediatorService.insertNewCompanyData(company);
        return {success: true, message: company.credentials.password};
    }

    async getCompanyData(password: string): Promise<CompanyDto> {
        return await this.dbMediatorService.fetchCompanyData({
            "credentials.password": password
        });
    }

    async getCompanyDataWithoutPassword(): Promise<CompanyDto> {
        return await this.dbMediatorService.fetchCompanyData({});
    }

    async changeCompanySettings(modified_settings: CompanySettingsModel): Promise<OperationFeedback> {
        let comp = await this.getCompanyDataWithoutPassword();
        return await this.dbMediatorService.updateCompanyData({
            _id: comp._id
        }, {
            $set: {settings: modified_settings}
        });
    }
}
