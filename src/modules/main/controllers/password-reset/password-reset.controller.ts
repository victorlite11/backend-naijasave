import { Body, Controller, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { HeadAdminGuard } from 'src/modules/shared/guards/head-admin/head-admin.guard';
import { OperationFeedback, PasswordResetData } from 'src/modules/shared/interface/shared-interfaces';
import { CompanyService } from 'src/modules/shared/services/company/company.service';
import { PasswordResetService } from 'src/modules/shared/services/password-reset/password-reset.service';

@Controller('password-reset')
export class PasswordResetController {
    constructor(
        private passwordResetService: PasswordResetService,
        private companyService: CompanyService
    ) {}

    @Post("get-password")
    @UseGuards(HeadAdminGuard)
    async getPassword(
        @Body() payload: {
            phoneNumber: string,
            cap: string
        }
    ): Promise<OperationFeedback> {
        let company = await this.companyService.getCompanyDataWithoutPassword()
        if(payload.cap != company.credentials.password) {
            throw new HttpException("Invalid CAP provided", HttpStatus.BAD_REQUEST)
        }
        
        return await this.passwordResetService.getPassword(payload.phoneNumber);
    }

    @Post("get-password-reset-verification-code")
    async getPasswordResetVerificationCode(
        @Body() payload: {
            phoneNumber: string
        }
    ) : Promise<OperationFeedback> {
        return await this.passwordResetService.getPasswordResetVerificationCode(payload.phoneNumber);
    }

    @Post("check-password-reset-verification-code")
    async checkPasswordResetVerificationCode(
        @Body() payload: {
            verificationCode: string,
            phoneNumber : string
        }
    ) : Promise<OperationFeedback> {
        return await this.passwordResetService.checkVerificationCode(payload)
    }

    @Post("reset-password")
    async resetPassword(
        @Body() payload: PasswordResetData
    ) : Promise<OperationFeedback> {
        return await this.passwordResetService.resetPassword(payload)
    }

}
