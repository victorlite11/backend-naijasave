import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FilterQuery, ObjectID, ObjectId } from 'mongodb';
import { ContributorDto, PrivilegeModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { DepositRequestDto } from 'src/modules/shared/dto/deposit-request/deposit-request-dto';
import { PaymentDto } from 'src/modules/shared/dto/payment/payment-dto';
import { SignupRequestDto } from 'src/modules/shared/dto/signup-request/signup-request-dto';
import { WithdrawalRequestDto } from 'src/modules/shared/dto/withdrawal-request/withdrawal-request-dto';
import { IdGenerator } from 'src/modules/shared/helpers/id-generator/id-generator';
import { EntityIdentity, OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { AdminService } from '../admin/admin.service';
import { CompanyService } from '../company/company.service';
import { ContributorsService } from '../contributors/contributors.service';
import { DbMediatorService } from '../db-mediator/db-mediator.service';
import { EntitiesMediatorService } from '../entities-mediator/entities-mediator/entities-mediator.service';
import { QualificationService } from '../qualification/qualification.service';
import { SmsMediatorService } from '../sms-mediator/sms-mediator/sms-mediator.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class RequestsService {

    constructor(
        private dbMediatorService: DbMediatorService,
        private entitiesMediatorService: EntitiesMediatorService,
        private contributorsService: ContributorsService,
        private qualificationService: QualificationService,
        private adminService: AdminService,
        private companyService: CompanyService,
        private smsMediatorService: SmsMediatorService,
        private transactionsService: TransactionsService
    ) {}

    async fetchSignupRequests(overseer_id?: string): Promise<SignupRequestDto[]> {
        if(!overseer_id) {
          return await this.dbMediatorService.fetchSignupRequests({});  
        }
        return await this.dbMediatorService.fetchSignupRequests({});
    }

    async fetchSignupRequest(id: string): Promise<SignupRequestDto> {
        return await this.dbMediatorService.fetchSignupRequest({_id: id}) as SignupRequestDto;
    }

    async insertSignupRequest(req: SignupRequestDto) {
 
        req._id = IdGenerator.generateKey(40);
        // construct username
        req.username = "No Username";

        // Qualification Checks
        await this.qualificationService.alreadyRegistered(req.phoneNumber, req.email);
        await this.qualificationService.awaitingApproval(req.phoneNumber, req.email);

        // create contributor directly if overseerId is an overseer
        let adminOverseer = await this.adminService.fetchAdmin(req.overseerId);
        if(adminOverseer) {
            return await this.contributorsService.createNewContributor(req);
        }

        // if(req.overseerId == "") {
        //     throw new HttpException("Cannot determine overseer. Please retry", HttpStatus.BAD_REQUEST);
        // }
        
        // register in db
        await this.dbMediatorService.insertSignupRequest(req);
    }

    async deleteSignupRequest(id: string) {
        // delete from Db
        await this.dbMediatorService.deleteSignupRequest(id);
    }

    async updateSignupRequest(id: string, update: boolean, newData: SignupRequestDto) {
        
        // find and update request object
        if(update) {
          await this.dbMediatorService.replaceSignupRequest({_id: id}, newData)  
        } else {
            await this.contributorsService.createNewContributor(newData);
        }
        
    }

    async insertDepositRequest(request: DepositRequestDto): Promise<boolean> {
        request._id = IdGenerator.generateKey(25);
        let entity = await this.entitiesMediatorService.fetchEntity(request.requester_id);
        
        await this.qualificationService.canMakeDepositRequest(entity.identity, entity.entity.privilege);
        
        if(entity.identity == EntityIdentity.CONTRIBUTOR) {
            request.purpose = "DailySavings";
            // is contributor
            await this.qualificationService.canDepositAnyAmount(request.amount, entity.entity.account.dailySavings, entity.entity.privilege as PrivilegeModel);
            await this.checkIfContributorHasAPendingDailySavingsDepositRequest(request);
            await this.checkIfContributorHasPaidHisDailySavingsForTheDate(request);
        }

        // set the request overseer_id to the entity's overseer_id
        request.overseer_id = entity.entity.basicInformation.overseerId;

        await this.dbMediatorService.insertDepositRequest(request);

        // check if sending notifications for deposit requests is turned on before sending
        let companySettings = await (await this.companyService.getCompanyDataWithoutPassword()).settings;

        if(companySettings.depositRequestsSMSNotification) {
            await this.smsMediatorService.sendDepositRequestSms(request)
        }
        return true;
    }
 
    private async checkIfContributorHasPaidHisDailySavingsForTheDate(depositPayload: DepositRequestDto) {
        // if contributor has already paid daily savings for that day
        let contributorTrxs = await this.transactionsService.getSuccessfulTransactions({
            contributor_id: depositPayload.requester_id,
            type : "DEPOSIT"
        });

        let paymentDate = new Date(depositPayload.date);
        //let didDailyDepositPaymentSameDate = contributorTrxs.filter(trx => (new Date(trx.date).toLocaleDateString() == paymentDate.toLocaleDateString() && trx.purpose == "DailySavings"))[0]

        // if (didDailyDepositPaymentSameDate) {
        //     throw new HttpException("You can only deposit daily savings once per day", HttpStatus.BAD_REQUEST) 
        // } 
    }

    private async checkIfContributorHasAPendingDailySavingsDepositRequest(depositPayload: DepositRequestDto) {
        // if contributor has already paid daily savings for that day
        let dailyDepositRequestAlreadyRegistered = await this.dbMediatorService.fetchOne <DepositRequestDto> (
            {"requester_id": depositPayload.requester_id, "purpose": depositPayload.purpose},
            {collection : "deposit_requests", db : "naijasave"}
        )

        // if (dailyDepositRequestAlreadyRegistered) {
        //     throw new HttpException("You can only deposit daily savings once per day", HttpStatus.BAD_REQUEST) 
        // } 
    }

    async forwardDepositRequestToOverseer(
        request_id: string, 
        overseer_id: string): Promise<OperationFeedback> {

        // set the overseer_id of the request to the overseer_id of the request's overseer_id
        let req = await this.dbMediatorService.fetchDepositRequest({_id: request_id});
        let entity = await this.entitiesMediatorService.fetchEntity(req.overseer_id);

        return await this.dbMediatorService.updateDepositRequest(
            {_id: request_id},
            {$set: {overseer_id: entity.entity.basicInformation.overseerId}}
        )
    }

    async forwardWithdrawalRequestToOverseer(
        request_id: string, 
        overseer_id: string): Promise<OperationFeedback> {

        // set the overseer_id of the request to the overseer_id of the request's overseer_id
        let req = await this.dbMediatorService.fetchWithdrawalRequest({_id: request_id});
        let entity = await this.entitiesMediatorService.fetchEntity(req.overseer_id);

        return await this.dbMediatorService.updateWithdrawalRequest(
            {_id: request_id},
            {$set: {overseer_id: entity.entity.basicInformation.overseerId}}
        )
    }

    async insertWithdrawalRequest(request: WithdrawalRequestDto): Promise<boolean> {
        request._id = IdGenerator.generateKey(25);
        let entity = await this.entitiesMediatorService.fetchEntity(request.requester_id);

        await this.qualificationService.hasEnoughBalance(request.amount, entity.entity.account);
        await this.qualificationService.canMakeWithdrawalRequest(entity.identity, entity.entity.privilege);
        
        if(entity.identity == EntityIdentity.CONTRIBUTOR) {
            
            // is contributor
            await this.qualificationService.canWithdrawWhileAccountIsImmature((<ContributorDto>entity.entity).activities.approvalDate, '18', entity.entity.privilege as PrivilegeModel)
        
        }

        // set the request overseer_id to the entity's overseer_id
        request.overseer_id = entity.entity.basicInformation.overseerId;

        await this.dbMediatorService.insertWithdrawalRequest(request);

        // check if sending notifications for deposit requests is turned on before sending
        let companySettings = await (await this.companyService.getCompanyDataWithoutPassword()).settings;

        if(companySettings.depositRequestsSMSNotification) {
            await this.smsMediatorService.sendWithdrawalRequestSms(request)
        }
        return true;
    }

    async fetchWithdrawalRequests(overseer_id?: string): Promise<WithdrawalRequestDto[]> {
        if(!overseer_id) {
            return await this.dbMediatorService.fetchWithdrawalRequests({});
        }
        return await this.dbMediatorService.fetchWithdrawalRequests({overseer_id: overseer_id});
    }

    async fetchWithdrawalRequest(request_id: string): Promise<WithdrawalRequestDto> {
        return await this.dbMediatorService.fetchWithdrawalRequest({_id: request_id});
    }

    async deleteWithdrawalRequest(request_id: string) {
        await this.dbMediatorService.deleteWithdrawalRequest({_id: request_id});
    }

    async deleteDepositRequest(request_id: string) {
        await this.dbMediatorService.deleteDepositRequest({_id: request_id});
    }
    
    async fetchDepositRequest(request_id: string, query?: FilterQuery<DepositRequestDto>): Promise<DepositRequestDto> {
        if(query) {
            return await this.dbMediatorService.fetchDepositRequest(query);
        }
        return await this.dbMediatorService.fetchDepositRequest({_id: request_id});
    }

    async fetchDepositRequests(overseer_id?: string): Promise<Array<DepositRequestDto>> {
        if(!overseer_id) {
            return await this.dbMediatorService.fetchDepositRequests({});
        }
        return await this.dbMediatorService.fetchDepositRequests({overseer_id: overseer_id});
    }
} 
