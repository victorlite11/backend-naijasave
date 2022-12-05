import { Body, Controller, Delete, Request, Get, HttpException, HttpStatus, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BasicContributorOverseerModel } from 'src/modules/shared/dto/basic-contributor/basic-contributor-dto';
import { ContributorDto } from 'src/modules/core/dtos/contributor/contributor';
import { AdminGuard } from 'src/modules/shared/guards/admin/admin.guard';
import { IFetchContributorsQueries, ContributorsCountResponse, SMSProforma } from 'src/modules/core/misc/models.core/models.core';
import { DbMediatorService } from 'src/modules/shared/services/db-mediator/db-mediator.service';
import { QualificationService } from 'src/modules/shared/services/qualification/qualification.service';
import { RequestsService } from 'src/modules/shared/services/requests/requests.service';
import { ContributorsService } from 'src/modules/shared/services/contributors/contributors.service';
import { AdminService } from 'src/modules/shared/services/admin/admin.service';
import { OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { CommissionService } from 'src/modules/shared/services/commission/commission/commission.service';
import { IdGenerator } from 'src/modules/shared/helpers/id-generator/id-generator';
import { ContributorsFetchGuard } from 'src/modules/shared/guards/contributors-fetch-guard/contributors-fetch-guard.guard';
import { AuthenticatedGuard } from 'src/modules/shared/guards/authenticated/authenticated.guard';
import { GeneralService } from 'src/modules/shared/services/general/general/general.service';
import { HeadAdminGuard } from 'src/modules/shared/guards/head-admin/head-admin.guard';

@Controller('contributors')
@UseGuards(AuthenticatedGuard)
export class ContributorController { 
    constructor(
        private contributorsService: ContributorsService,
        private requestsService: RequestsService,
        private qualificationService: QualificationService,
        private adminsService: AdminService,
        private dbMediatorService : DbMediatorService,
        private generalService: GeneralService,
        private commissionService : CommissionService
        ) {}

    @Get()
    @UseGuards(ContributorsFetchGuard)
    async fetchContributors(@Query() queries: IFetchContributorsQueries): Promise<Array<ContributorDto> | ContributorsCountResponse> {
        let contributors = await this.contributorsService.fetchContributors(queries);
        if(queries.count) {
            let counts = new ContributorsCountResponse();
            contributors.forEach(contributor => {
                if(contributor.identity.isContributor) {
                    counts.contributors += 1;
                } else if(contributor.identity.isInvestor) {
                    counts.investors += 1;
                } else if(contributor.identity.isSubContributor) {
                    counts.subs += 1;
                } else {
                    counts.supers += 1;
                }
            });
            counts.total = contributors.length;
            return counts;
        }
        return contributors.map(c => this.generalService.fakePassword(c))
    }

    // @Get('coi') [Only used when updating data models in the database]
    // async updateOverseerId() :Promise<number> {
    //     return await this.contributorsService.updateDatabase()
    // }

    @Get('self')
    async fetchSelfData(@Request() req: any): Promise<ContributorDto> {

        let contributor = await this.contributorsService.fetchContributor(req.user.userId);
        return this.generalService.fakePassword(contributor);
        
    }

    @Get(':id')
    async fetchContributor(@Param('id') id: string, @Request() req: any): Promise<ContributorDto> {
        id = (id == undefined || id == "undefined") ? req.user.userId : id;
        let contributor = await this.contributorsService.fetchContributor(id || req.user.userId);
        if(!contributor) {
            throw new NotFoundException(`Contributor with id ${id} does not exist`);
        }

        // charge monthly commission
        await this.commissionService.chargeMonthlyCommission({contributorId : contributor._id});
 
        return this.generalService.fakePassword(contributor);
    }

    @Post('new-contributor')
    @UseGuards(AdminGuard)
    async createNewContributor(@Query('id') signupRequestId: string) {
        if(!signupRequestId) {
            throw new HttpException("No Signup Request ID Provided", HttpStatus.EXPECTATION_FAILED);
        }
        let signupRequest = await this.requestsService.fetchSignupRequest(signupRequestId);
        if(!signupRequest) {
            throw new NotFoundException(`Request with id ${signupRequestId} does not exist`);
        }
        await this.contributorsService.createNewContributor(signupRequest);
    }

    @Put('change-username')
    async changeUsername(@Body() payload: {id: string, username: string, sms?: SMSProforma}): Promise<boolean> {
        return this.contributorsService.changeUsername(payload.id, payload.username, payload.sms);
    }

    @Put('change-overseer')
    @UseGuards(AdminGuard)
    async changeOverseer(@Body() payload: {admin_id: string, contributor_id: string, new_overseer_id: string}): Promise<OperationFeedback> {
        if(!payload.admin_id) {
            throw new HttpException("No admin id provided", HttpStatus.BAD_REQUEST);
        }

        let admin = await this.adminsService.fetchAdmin(payload.admin_id);

        await this.qualificationService.canChangeContributorOversser(admin.privilege!!);

        return await this.contributorsService.changeOverseer(payload.contributor_id, payload.new_overseer_id);
    }

    @Post('fetch-overseer')
    async setSubordinates(
        @Body() payload: {contributor_id: string}
    ): Promise<BasicContributorOverseerModel> {
        return await this.contributorsService.getContributorOverseer(payload.contributor_id);
    }

    @Delete(':id')
    @UseGuards(HeadAdminGuard)
    async deleteContributor(@Param('id') id: string, @Query('admin_id') admin_id: string): Promise<boolean> {
        let contributor = await this.contributorsService.fetchContributor(id);
        if(!contributor) {
            throw new NotFoundException(`Contributor with id ${id} does not exist`);
        }

        if(!admin_id) {
            throw new NotFoundException(`No admin id provided`);
        }

        await this.qualificationService.canRemoveContributors((await this.adminsService.fetchAdmin(admin_id)).privilege!!);

        return await this.contributorsService.deleteContributor(id);
        
    }

}
