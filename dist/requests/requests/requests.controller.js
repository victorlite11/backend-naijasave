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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestsController = void 0;
const common_1 = require("@nestjs/common");
const admin_dto_1 = require("../../modules/shared/dto/admin/admin-dto");
const deposit_request_dto_1 = require("../../modules/shared/dto/deposit-request/deposit-request-dto");
const signup_request_dto_1 = require("../../modules/shared/dto/signup-request/signup-request-dto");
const withdrawal_request_dto_1 = require("../../modules/shared/dto/withdrawal-request/withdrawal-request-dto");
const authenticated_guard_1 = require("../../modules/shared/guards/authenticated/authenticated.guard");
const head_admin_guard_1 = require("../../modules/shared/guards/head-admin/head-admin.guard");
const shared_interfaces_1 = require("../../modules/shared/interface/shared-interfaces");
const entities_mediator_service_1 = require("../../modules/shared/services/entities-mediator/entities-mediator/entities-mediator.service");
const qualification_service_1 = require("../../modules/shared/services/qualification/qualification.service");
const requests_service_1 = require("../../modules/shared/services/requests/requests.service");
let RequestsController = class RequestsController {
    constructor(requestsService, entitiesMediatorService, qualificationService) {
        this.requestsService = requestsService;
        this.entitiesMediatorService = entitiesMediatorService;
        this.qualificationService = qualificationService;
    }
    async countRequests(overseer_id) {
        let count = new shared_interfaces_1.RequestsCountResponse();
        let deposits = await this.requestsService.fetchDepositRequests(overseer_id);
        let withdrawals = await this.requestsService.fetchWithdrawalRequests(overseer_id);
        let signups = await this.requestsService.fetchSignupRequests(overseer_id);
        count.deposits = deposits.length;
        count.withdrawals = withdrawals.length;
        count.signups = signups.length;
        count.total = deposits.length + withdrawals.length + signups.length;
        return count;
    }
    async fetchSignupRequest(id) {
        if (!id) {
            return await this.requestsService.fetchSignupRequests();
        }
        return await this.requestsService.fetchSignupRequest(id);
    }
    async insertSignupRequest(req) {
        await this.requestsService.insertSignupRequest(req);
    }
    async deleteSignupRequest(admin_id, id) {
        if (!id) {
            throw new common_1.HttpException("No Signup Request ID Provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        if (!admin_id) {
            throw new common_1.HttpException("No Admin ID Provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        let admin = await this.entitiesMediatorService.fetchEntity(admin_id);
        await this.qualificationService.canRejectSubordinatesRequests(admin.identity, admin.entity.privilege);
        let signupRequest = await this.requestsService.fetchSignupRequest(id);
        if (!signupRequest) {
            throw new common_1.NotFoundException(`Request with id ${id} does not exist`);
        }
        await this.requestsService.deleteSignupRequest(id);
    }
    async updateSignupRequest(admin_id, id, should_update, update) {
        if (!id) {
            throw new common_1.HttpException("No Signup Request ID Provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        if (!admin_id) {
            throw new common_1.HttpException("No Admin ID Provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        let admin = await this.entitiesMediatorService.fetchEntity(admin_id);
        await this.qualificationService.canEditSignupRequest(admin.entity.privilege);
        return await this.requestsService.updateSignupRequest(id, should_update, update);
    }
    async forwardDepositRequestToOverseer(request_id, overseer_id) {
        if (!request_id || !overseer_id) {
            throw new common_1.HttpException("Request ID or Overseer Id not Provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        return await this.requestsService.forwardDepositRequestToOverseer(request_id, overseer_id);
    }
    async forwardWithdrawalRequestToOverseer(request_id, overseer_id) {
        if (!request_id || !overseer_id) {
            throw new common_1.HttpException("Request ID or Overseer Id not Provided", common_1.HttpStatus.EXPECTATION_FAILED);
        }
        return await this.requestsService.forwardWithdrawalRequestToOverseer(request_id, overseer_id);
    }
    async insertDepositRequest(request) {
        let response = await this.requestsService.insertDepositRequest(request);
        if (response) {
            return {
                success: true
            };
        }
    }
    async deleteDepositRequest(request_id) {
        let r = await this.requestsService.fetchDepositRequest(request_id);
        let overseer = await this.entitiesMediatorService.fetchEntity(r.overseer_id);
        await this.qualificationService.canRejectSubordinatesRequests(overseer.identity, overseer.entity.privilege);
        await this.requestsService.deleteDepositRequest(request_id);
    }
    async deleteWithdrawalRequest(request_id) {
        let r = await this.requestsService.fetchWithdrawalRequest(request_id);
        let overseer = await this.entitiesMediatorService.fetchEntity(r.overseer_id);
        await this.qualificationService.canRejectSubordinatesRequests(overseer.identity, overseer.entity.privilege);
        await this.requestsService.deleteWithdrawalRequest(request_id);
    }
    async fetchDepositRequests(overseer_id) {
        return await this.requestsService.fetchDepositRequests(overseer_id);
    }
    async insertWithdrawalRequest(request) {
        let response = await this.requestsService.insertWithdrawalRequest(request);
        if (response) {
            return {
                success: true
            };
        }
    }
    async fetchWithdrawalRequests(overseer_id) {
        return await this.requestsService.fetchWithdrawalRequests(overseer_id);
    }
};
__decorate([
    common_1.Get('count-requests'),
    __param(0, common_1.Query('overseer_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "countRequests", null);
__decorate([
    common_1.Get('signup-requests'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __param(0, common_1.Query('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "fetchSignupRequest", null);
__decorate([
    common_1.Post('signup-requests'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_request_dto_1.SignupRequestDto]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "insertSignupRequest", null);
__decorate([
    common_1.Delete('signup-requests'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    common_1.UseGuards(head_admin_guard_1.HeadAdminGuard),
    __param(0, common_1.Query("admin_id")), __param(1, common_1.Query('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "deleteSignupRequest", null);
__decorate([
    common_1.Put('signup-requests'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    common_1.UseGuards(head_admin_guard_1.HeadAdminGuard),
    __param(0, common_1.Query("admin_id")), __param(1, common_1.Query("id")), __param(2, common_1.Query("update")), __param(3, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean, signup_request_dto_1.SignupRequestDto]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "updateSignupRequest", null);
__decorate([
    common_1.Get('forward-deposit-request-to-overseer'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __param(0, common_1.Query("request_id")),
    __param(1, common_1.Query("overseer_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "forwardDepositRequestToOverseer", null);
__decorate([
    common_1.Get('forward-withdrawal-request-to-overseer'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __param(0, common_1.Query("request_id")),
    __param(1, common_1.Query("overseer_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "forwardWithdrawalRequestToOverseer", null);
__decorate([
    common_1.Post('deposit-requests'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [deposit_request_dto_1.DepositRequestDto]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "insertDepositRequest", null);
__decorate([
    common_1.Delete('deposit-requests'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __param(0, common_1.Query("request_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "deleteDepositRequest", null);
__decorate([
    common_1.Delete('withdrawal-requests'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __param(0, common_1.Query("request_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "deleteWithdrawalRequest", null);
__decorate([
    common_1.Get('deposit-requests'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __param(0, common_1.Query('overseer_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "fetchDepositRequests", null);
__decorate([
    common_1.Post('withdrawal-requests'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [withdrawal_request_dto_1.WithdrawalRequestDto]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "insertWithdrawalRequest", null);
__decorate([
    common_1.Get('withdrawal-requests'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __param(0, common_1.Query('overseer_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "fetchWithdrawalRequests", null);
RequestsController = __decorate([
    common_1.Controller('requests'),
    __metadata("design:paramtypes", [requests_service_1.RequestsService,
        entities_mediator_service_1.EntitiesMediatorService,
        qualification_service_1.QualificationService])
], RequestsController);
exports.RequestsController = RequestsController;
//# sourceMappingURL=requests.controller.js.map