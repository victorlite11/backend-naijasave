"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const contributor_dto_1 = require("../../dto/contributor/contributor-dto");
const deposit_request_dto_1 = require("../../dto/deposit-request/deposit-request-dto");
const payment_dto_1 = require("../../dto/payment/payment-dto");
const signup_request_dto_1 = require("../../dto/signup-request/signup-request-dto");
const withdrawal_request_dto_1 = require("../../dto/withdrawal-request/withdrawal-request-dto");
const id_generator_1 = require("../../helpers/id-generator/id-generator");
const shared_interfaces_1 = require("../../interface/shared-interfaces");
const admin_service_1 = require("../admin/admin.service");
const company_service_1 = require("../company/company.service");
const contributors_service_1 = require("../contributors/contributors.service");
const db_mediator_service_1 = require("../db-mediator/db-mediator.service");
const entities_mediator_service_1 = require("../entities-mediator/entities-mediator/entities-mediator.service");
const qualification_service_1 = require("../qualification/qualification.service");
const sms_mediator_service_1 = require("../sms-mediator/sms-mediator/sms-mediator.service");
const transactions_service_1 = require("../transactions/transactions.service");
let RequestsService = class RequestsService {
    constructor(dbMediatorService, entitiesMediatorService, contributorsService, qualificationService, adminService, companyService, smsMediatorService, transactionsService) {
        this.dbMediatorService = dbMediatorService;
        this.entitiesMediatorService = entitiesMediatorService;
        this.contributorsService = contributorsService;
        this.qualificationService = qualificationService;
        this.adminService = adminService;
        this.companyService = companyService;
        this.smsMediatorService = smsMediatorService;
        this.transactionsService = transactionsService;
    }
    async fetchSignupRequests(overseer_id) {
        if (!overseer_id) {
            return await this.dbMediatorService.fetchSignupRequests({});
        }
        return await this.dbMediatorService.fetchSignupRequests({});
    }
    async fetchSignupRequest(id) {
        return await this.dbMediatorService.fetchSignupRequest({ _id: id });
    }
    async insertSignupRequest(req) {
        req._id = id_generator_1.IdGenerator.generateKey(40);
        req.username = "No Username";
        await this.qualificationService.alreadyRegistered(req.phoneNumber, req.email);
        await this.qualificationService.awaitingApproval(req.phoneNumber, req.email);
        let adminOverseer = await this.adminService.fetchAdmin(req.overseerId);
        if (adminOverseer) {
            return await this.contributorsService.createNewContributor(req);
        }
        await this.dbMediatorService.insertSignupRequest(req);
    }
    async deleteSignupRequest(id) {
        await this.dbMediatorService.deleteSignupRequest(id);
    }
    async updateSignupRequest(id, update, newData) {
        if (update) {
            await this.dbMediatorService.replaceSignupRequest({ _id: id }, newData);
        }
        else {
            await this.contributorsService.createNewContributor(newData);
        }
    }
    async insertDepositRequest(request) {
        request._id = id_generator_1.IdGenerator.generateKey(25);
        let entity = await this.entitiesMediatorService.fetchEntity(request.requester_id);
        await this.qualificationService.canMakeDepositRequest(entity.identity, entity.entity.privilege);
        if (entity.identity == shared_interfaces_1.EntityIdentity.CONTRIBUTOR) {
            request.purpose = "DailySavings";
            await this.qualificationService.canDepositAnyAmount(request.amount, entity.entity.account.dailySavings, entity.entity.privilege);
            await this.checkIfContributorHasAPendingDailySavingsDepositRequest(request);
            await this.checkIfContributorHasPaidHisDailySavingsForTheDate(request);
        }
        request.overseer_id = entity.entity.basicInformation.overseerId;
        await this.dbMediatorService.insertDepositRequest(request);
        let companySettings = await (await this.companyService.getCompanyDataWithoutPassword()).settings;
        if (companySettings.depositRequestsSMSNotification) {
            await this.smsMediatorService.sendDepositRequestSms(request);
        }
        return true;
    }
    async checkIfContributorHasPaidHisDailySavingsForTheDate(depositPayload) {
        let contributorTrxs = await this.transactionsService.getSuccessfulTransactions({
            contributor_id: depositPayload.requester_id,
            type: "DEPOSIT"
        });
        let paymentDate = new Date(depositPayload.date);
    }
    async checkIfContributorHasAPendingDailySavingsDepositRequest(depositPayload) {
        let dailyDepositRequestAlreadyRegistered = await this.dbMediatorService.fetchOne({ "requester_id": depositPayload.requester_id, "purpose": depositPayload.purpose }, { collection: "deposit_requests", db: "naijasave" });
    }
    async forwardDepositRequestToOverseer(request_id, overseer_id) {
        let req = await this.dbMediatorService.fetchDepositRequest({ _id: request_id });
        let entity = await this.entitiesMediatorService.fetchEntity(req.overseer_id);
        return await this.dbMediatorService.updateDepositRequest({ _id: request_id }, { $set: { overseer_id: entity.entity.basicInformation.overseerId } });
    }
    async forwardWithdrawalRequestToOverseer(request_id, overseer_id) {
        let req = await this.dbMediatorService.fetchWithdrawalRequest({ _id: request_id });
        let entity = await this.entitiesMediatorService.fetchEntity(req.overseer_id);
        return await this.dbMediatorService.updateWithdrawalRequest({ _id: request_id }, { $set: { overseer_id: entity.entity.basicInformation.overseerId } });
    }
    async insertWithdrawalRequest(request) {
        request._id = id_generator_1.IdGenerator.generateKey(25);
        let entity = await this.entitiesMediatorService.fetchEntity(request.requester_id);
        await this.qualificationService.hasEnoughBalance(request.amount, entity.entity.account);
        await this.qualificationService.canMakeWithdrawalRequest(entity.identity, entity.entity.privilege);
        if (entity.identity == shared_interfaces_1.EntityIdentity.CONTRIBUTOR) {
            await this.qualificationService.canWithdrawWhileAccountIsImmature(entity.entity.activities.approvalDate, '18', entity.entity.privilege);
        }
        request.overseer_id = entity.entity.basicInformation.overseerId;
        await this.dbMediatorService.insertWithdrawalRequest(request);
        let companySettings = await (await this.companyService.getCompanyDataWithoutPassword()).settings;
        if (companySettings.depositRequestsSMSNotification) {
            await this.smsMediatorService.sendWithdrawalRequestSms(request);
        }
        return true;
    }
    async fetchWithdrawalRequests(overseer_id) {
        if (!overseer_id) {
            return await this.dbMediatorService.fetchWithdrawalRequests({});
        }
        return await this.dbMediatorService.fetchWithdrawalRequests({ overseer_id: overseer_id });
    }
    async fetchWithdrawalRequest(request_id) {
        return await this.dbMediatorService.fetchWithdrawalRequest({ _id: request_id });
    }
    async deleteWithdrawalRequest(request_id) {
        await this.dbMediatorService.deleteWithdrawalRequest({ _id: request_id });
    }
    async deleteDepositRequest(request_id) {
        await this.dbMediatorService.deleteDepositRequest({ _id: request_id });
    }
    async fetchDepositRequest(request_id, query) {
        if (query) {
            return await this.dbMediatorService.fetchDepositRequest(query);
        }
        return await this.dbMediatorService.fetchDepositRequest({ _id: request_id });
    }
    async fetchDepositRequests(overseer_id) {
        if (!overseer_id) {
            return await this.dbMediatorService.fetchDepositRequests({});
        }
        return await this.dbMediatorService.fetchDepositRequests({ overseer_id: overseer_id });
    }
};
RequestsService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [db_mediator_service_1.DbMediatorService,
        entities_mediator_service_1.EntitiesMediatorService,
        contributors_service_1.ContributorsService,
        qualification_service_1.QualificationService,
        admin_service_1.AdminService,
        company_service_1.CompanyService,
        sms_mediator_service_1.SmsMediatorService,
        transactions_service_1.TransactionsService])
], RequestsService);
exports.RequestsService = RequestsService;
//# sourceMappingURL=requests.service.js.map