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
exports.QualificationService = void 0;
const common_1 = require("@nestjs/common");
const admin_dto_1 = require("../../dto/admin/admin-dto");
const contributor_dto_1 = require("../../dto/contributor/contributor-dto");
const shared_interfaces_1 = require("../../interface/shared-interfaces");
const db_mediator_service_1 = require("../db-mediator/db-mediator.service");
let QualificationService = class QualificationService {
    constructor(dbMediatorService) {
        this.dbMediatorService = dbMediatorService;
    }
    async hasEnoughBalance(amount, account) {
        let amt = Number(amount);
        let balance = Number(account.balance);
        if (balance < amt) {
            throw new common_1.HttpException("Insufficient Balance", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async canCreditOthers(entity, privilege) {
        if (entity == shared_interfaces_1.EntityIdentity.ADMIN) {
            privilege = privilege;
            if (!privilege.canCreditOthers) {
                throw new common_1.HttpException("Cannot credit others", common_1.HttpStatus.BAD_REQUEST);
            }
        }
        else {
            privilege = privilege;
            if (!privilege.canDepositSubordinates) {
                throw new common_1.HttpException("Cannot credit subordinates", common_1.HttpStatus.BAD_REQUEST);
            }
        }
    }
    async canDebitOthersWithoutChecks(entity, privilege) {
        if (entity == shared_interfaces_1.EntityIdentity.ADMIN) {
            privilege = privilege;
            if (!privilege.canDebitOthersWithoutChecks) {
                throw new common_1.HttpException("Cannot debit others", common_1.HttpStatus.BAD_REQUEST);
            }
        }
        else {
            privilege = privilege;
            if (!privilege.canWithdrawSubordinates) {
                if (!privilege.canWithdrawSubordinatesWithoutChecks) {
                    throw new common_1.HttpException("Cannot debit subordinates", common_1.HttpStatus.BAD_REQUEST);
                }
            }
        }
    }
    async canDebitOthersWithChecks(entity, privilege) {
        if (entity == shared_interfaces_1.EntityIdentity.ADMIN) {
            privilege = privilege;
            if (!privilege.canDebitOthersWithChecks) {
                throw new common_1.HttpException("Cannot debit others", common_1.HttpStatus.BAD_REQUEST);
            }
        }
        else {
            privilege = privilege;
            if (!privilege.canWithdrawSubordinates) {
                throw new common_1.HttpException("Cannot debit subordinates", common_1.HttpStatus.BAD_REQUEST);
            }
        }
    }
    async canWithdraw(entity, privilege) {
        if (entity == shared_interfaces_1.EntityIdentity.ADMIN) {
            privilege = privilege;
            if (!privilege.canWithdrawSelf) {
                throw new common_1.HttpException("Cannot debit this account", common_1.HttpStatus.BAD_REQUEST);
            }
        }
        else {
            privilege = privilege;
            if (!privilege.canWithdraw) {
                throw new common_1.HttpException("Cannot debit this account", common_1.HttpStatus.BAD_REQUEST);
            }
        }
    }
    async canDeposit(entity, privilege) {
        if (entity == shared_interfaces_1.EntityIdentity.ADMIN) {
            privilege = privilege;
            if (!privilege.canDepositSelf) {
                throw new common_1.HttpException("Cannot deposit this account", common_1.HttpStatus.BAD_REQUEST);
            }
        }
        else {
            privilege = privilege;
            if (!privilege.canDeposit) {
                throw new common_1.HttpException("Cannot deposit this account", common_1.HttpStatus.BAD_REQUEST);
            }
        }
    }
    async canMakeWithdrawalRequest(entity, privilege) {
        if (entity == shared_interfaces_1.EntityIdentity.ADMIN) {
            privilege = privilege;
            if (!privilege.canPlaceWithdrawalRequest) {
                throw new common_1.HttpException("You cannot place withdrawal request", common_1.HttpStatus.BAD_REQUEST);
            }
        }
        else {
            privilege = privilege;
            if (!privilege.canMakeWithdrawalRequest) {
                throw new common_1.HttpException("You cannot place withdrawal request", common_1.HttpStatus.BAD_REQUEST);
            }
        }
    }
    async canUseSMS(entity, privilege) {
        if (entity == shared_interfaces_1.EntityIdentity.ADMIN) {
            privilege = privilege;
            if (!privilege.canSendSMS) {
                throw new common_1.HttpException("You cannot initiate SMS notifications", common_1.HttpStatus.BAD_REQUEST);
            }
        }
        else {
            privilege = privilege;
            if (!privilege.canUseSMS) {
                throw new common_1.HttpException("You cannot initiate SMS notifications", common_1.HttpStatus.BAD_REQUEST);
            }
        }
    }
    async canMakeDepositRequest(entity, privilege) {
        if (entity == shared_interfaces_1.EntityIdentity.ADMIN) {
            privilege = privilege;
            if (!privilege.canPlaceDepositRequest) {
                throw new common_1.HttpException("You cannot place deposit request", common_1.HttpStatus.BAD_REQUEST);
            }
        }
        else {
            privilege = privilege;
            if (!privilege.canMakeDepositRequest) {
                throw new common_1.HttpException("You cannot place deposit request", common_1.HttpStatus.BAD_REQUEST);
            }
        }
    }
    async canEditSignupRequest(privilege) {
        if (!privilege.canEditSignupRequestData) {
            throw new common_1.HttpException("You cannot edit signup requests", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async canChangeContributorOversser(privilege) {
        if (!privilege.canChangeContributorsOverseer) {
            throw new common_1.HttpException("You cannot change contributors' overseers", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async canRemoveContributors(privilege) {
        if (!privilege.canRemoveContributors) {
            throw new common_1.HttpException("You cannot delete contributors", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async canWithdrawWhileAccountIsImmature(approvalDate, maturityDays, privilege) {
        if (!privilege.canWithdrawWhileImmature) {
            await this.accountIsMartured(approvalDate, maturityDays);
        }
    }
    async accountIsMartured(contributorApprovalDate, maturityDays) {
        let initDate = "1/1/2020";
        let finalDate = `1/${maturityDays}/2020`;
        let diffMilli = Math.abs(Date.parse(finalDate) - Date.parse(initDate));
        let today = Date.now();
        let diff = Math.abs(today - Date.parse(contributorApprovalDate));
        if (diff < diffMilli) {
            throw new common_1.HttpException(`You cannot withdraw within ${maturityDays} days of registration`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async canDepositAnyAmount(amount, dailySavings, privilege) {
        privilege = privilege;
        if (!privilege.canDepositAnyAmount) {
            await this.amountEqualsDailySavings(amount, dailySavings);
        }
    }
    async amountEqualsDailySavings(amount, dailySavings) {
        if (Number(amount) != Number(dailySavings)) {
            throw new common_1.HttpException("You cannot deposit any amount other than your daily savings amount", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async canRejectSubordinatesRequests(entity, privilege) {
        if (entity == shared_interfaces_1.EntityIdentity.ADMIN) {
            privilege = privilege;
            if (!privilege.canRejectContributorsRequests) {
                throw new common_1.HttpException("You cannot Reject Requests (It is advised you forward it to your overseer)", common_1.HttpStatus.BAD_REQUEST);
            }
        }
        else {
            privilege = privilege;
            if (!privilege.canRejectSubordinatesRequests) {
                throw new common_1.HttpException("You cannot Reject Requests (It is advised you forward it to your overseer)", common_1.HttpStatus.BAD_REQUEST);
            }
        }
    }
    async canAcceptSubordinatesRequests(entity, privilege) {
        if (entity == shared_interfaces_1.EntityIdentity.ADMIN) {
            privilege = privilege;
            if (!privilege.canAcceptContributorsRequests) {
                throw new common_1.HttpException("You cannot Accept Requests (It is advised you forward it to your overseer)", common_1.HttpStatus.BAD_REQUEST);
            }
        }
        else {
            privilege = privilege;
            if (!privilege.canAcceptSubordinatesRequests) {
                throw new common_1.HttpException("You cannot Accept Requests (It is advised you forward it to your overseer)", common_1.HttpStatus.BAD_REQUEST);
            }
        }
    }
    async alreadyRegistered(phoneNumber, email) {
        if (phoneNumber) {
            let contributor = await this.dbMediatorService.fetchContributor({ "credentials.phoneNumber": phoneNumber });
            if (contributor) {
                throw new common_1.HttpException("Account already exists", common_1.HttpStatus.BAD_REQUEST);
            }
        }
        if (email) {
            let contributor = await this.dbMediatorService.fetchContributor({ "credentials.email": email });
            if (contributor) {
                throw new common_1.HttpException("Account already exists", common_1.HttpStatus.BAD_REQUEST);
            }
        }
    }
    async awaitingApproval(phoneNumber, email) {
        if (phoneNumber) {
            let request = await this.dbMediatorService.fetchSignupRequest({ "phoneNumber": phoneNumber });
            if (request) {
                throw new common_1.HttpException("Signup request is under approval", common_1.HttpStatus.BAD_REQUEST);
            }
        }
        if (email) {
            let request = await this.dbMediatorService.fetchSignupRequest({ "email": email });
            if (request) {
                throw new common_1.HttpException("Signup request is under approval", common_1.HttpStatus.BAD_REQUEST);
            }
        }
    }
};
QualificationService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [db_mediator_service_1.DbMediatorService])
], QualificationService);
exports.QualificationService = QualificationService;
//# sourceMappingURL=qualification.service.js.map