import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AdminPrivilegeModel } from 'src/modules/shared/dto/admin/admin-dto';
import { DepositRequestDto } from 'src/modules/shared/dto/deposit-request/deposit-request-dto';
import { SignupRequestDto } from 'src/modules/shared/dto/signup-request/signup-request-dto';
import { WithdrawalRequestDto } from 'src/modules/shared/dto/withdrawal-request/withdrawal-request-dto';
import { AuthenticatedGuard } from 'src/modules/shared/guards/authenticated/authenticated.guard';
import { HeadAdminGuard } from 'src/modules/shared/guards/head-admin/head-admin.guard';
import { OperationFeedback, RequestsCountResponse } from 'src/modules/shared/interface/shared-interfaces';
import { EntitiesMediatorService } from 'src/modules/shared/services/entities-mediator/entities-mediator/entities-mediator.service';
import { QualificationService } from 'src/modules/shared/services/qualification/qualification.service';
import { RequestsService } from 'src/modules/shared/services/requests/requests.service';

// Get request => signup || deposit || withdrawal
@Controller('requests')
export class RequestsController {
    constructor(
        private requestsService: RequestsService,
        private entitiesMediatorService: EntitiesMediatorService,
        private qualificationService: QualificationService
        ) {}

    @Get('count-requests')
    async countRequests(
        @Query('overseer_id') overseer_id: string
    ): Promise<RequestsCountResponse> {
        let count = new RequestsCountResponse();
        let deposits = await this.requestsService.fetchDepositRequests(overseer_id);
        let withdrawals = await this.requestsService.fetchWithdrawalRequests(overseer_id);
        let signups = await this.requestsService.fetchSignupRequests(overseer_id);
        count.deposits = deposits.length;
        count.withdrawals = withdrawals.length;
        count.signups = signups.length
        count.total = deposits.length + withdrawals.length + signups.length;
        return count;
    }

    @Get('signup-requests')
    @UseGuards(AuthenticatedGuard)
    async fetchSignupRequest(@Query('id') id: string): Promise<SignupRequestDto | SignupRequestDto[]> {
        if(!id) {
            return await this.requestsService.fetchSignupRequests();
        }
        return await this.requestsService.fetchSignupRequest(id);
    }

    @Post('signup-requests')
    async insertSignupRequest(@Body() req: SignupRequestDto) {
        await this.requestsService.insertSignupRequest(req);
    }

    @Delete('signup-requests')
    @UseGuards(AuthenticatedGuard)
    @UseGuards(HeadAdminGuard)
    async deleteSignupRequest(@Query("admin_id") admin_id: string, @Query('id') id: string) {
        if(!id) {
            throw new HttpException("No Signup Request ID Provided", HttpStatus.EXPECTATION_FAILED);
        }

        if(!admin_id) {
            throw new HttpException("No Admin ID Provided", HttpStatus.EXPECTATION_FAILED);
        }

        let admin = await this.entitiesMediatorService.fetchEntity(admin_id);

        await this.qualificationService.canRejectSubordinatesRequests(admin.identity, admin.entity.privilege);


        let signupRequest = await this.requestsService.fetchSignupRequest(id);
        if(!signupRequest) {
            throw new NotFoundException(`Request with id ${id} does not exist`);
        }
        
        await this.requestsService.deleteSignupRequest(id);
    }

    @Put('signup-requests')
    @UseGuards(AuthenticatedGuard)
    @UseGuards(HeadAdminGuard)
    async updateSignupRequest(@Query("admin_id") admin_id: string, @Query("id") id: string, @Query("update") should_update: boolean, @Body() update: SignupRequestDto) {
        if(!id) {
            throw new HttpException("No Signup Request ID Provided", HttpStatus.EXPECTATION_FAILED);
        }
        if(!admin_id) {
            throw new HttpException("No Admin ID Provided", HttpStatus.EXPECTATION_FAILED);
        }

        let admin = await this.entitiesMediatorService.fetchEntity(admin_id);

        await this.qualificationService.canEditSignupRequest(admin.entity.privilege as AdminPrivilegeModel);

        return await this.requestsService.updateSignupRequest(id, should_update, update);
    }

    @Get('forward-deposit-request-to-overseer')
    @UseGuards(AuthenticatedGuard)
    async forwardDepositRequestToOverseer(
        @Query("request_id") request_id: string, 
        @Query("overseer_id") overseer_id: string): Promise<OperationFeedback> {
        if(!request_id || !overseer_id) {
            throw new HttpException("Request ID or Overseer Id not Provided", HttpStatus.EXPECTATION_FAILED);
        }
        return await this.requestsService.forwardDepositRequestToOverseer(request_id, overseer_id);
    }

    @Get('forward-withdrawal-request-to-overseer')
    @UseGuards(AuthenticatedGuard)
    async forwardWithdrawalRequestToOverseer(
        @Query("request_id") request_id: string, 
        @Query("overseer_id") overseer_id: string): Promise<OperationFeedback> {
        if(!request_id || !overseer_id) {
            throw new HttpException("Request ID or Overseer Id not Provided", HttpStatus.EXPECTATION_FAILED);
        }
        return await this.requestsService.forwardWithdrawalRequestToOverseer(request_id, overseer_id);
    }

    @Post('deposit-requests')
    @UseGuards(AuthenticatedGuard)
    async insertDepositRequest(@Body() request: DepositRequestDto) {
        let response = await this.requestsService.insertDepositRequest(request);
        if(response) {
            return {
                success: true
            }
        }
    }

    @Delete('deposit-requests')
    @UseGuards(AuthenticatedGuard)
    async deleteDepositRequest(@Query("request_id") request_id: string) {
        let r = await this.requestsService.fetchDepositRequest(request_id);
        let overseer = await this.entitiesMediatorService.fetchEntity(r.overseer_id);

        await this.qualificationService.canRejectSubordinatesRequests(overseer.identity, overseer.entity.privilege);

        await this.requestsService.deleteDepositRequest(request_id);
    }

    @Delete('withdrawal-requests')
    @UseGuards(AuthenticatedGuard)
    async deleteWithdrawalRequest(@Query("request_id") request_id: string) {
        let r = await this.requestsService.fetchWithdrawalRequest(request_id);
        let overseer = await this.entitiesMediatorService.fetchEntity(r.overseer_id);

        await this.qualificationService.canRejectSubordinatesRequests(overseer.identity, overseer.entity.privilege);

        await this.requestsService.deleteWithdrawalRequest(request_id);
    }

    @Get('deposit-requests')
    @UseGuards(AuthenticatedGuard)
    async fetchDepositRequests(
        @Query('overseer_id') overseer_id: string): Promise<Array<DepositRequestDto>> {
        
        return await this.requestsService.fetchDepositRequests(overseer_id);
    }

    @Post('withdrawal-requests')
    @UseGuards(AuthenticatedGuard)
    async insertWithdrawalRequest(@Body() request: WithdrawalRequestDto) {
        let response = await this.requestsService.insertWithdrawalRequest(request);
        if(response) {
            return {
                success: true
            }
        }
    }

    @Get('withdrawal-requests')
    @UseGuards(AuthenticatedGuard)
    async fetchWithdrawalRequests(@Query('overseer_id') overseer_id: string): Promise<WithdrawalRequestDto[]> {
        return await this.requestsService.fetchWithdrawalRequests(overseer_id);
    }

}
