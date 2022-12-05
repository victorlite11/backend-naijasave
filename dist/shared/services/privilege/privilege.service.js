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
exports.PrivilegeService = void 0;
const common_1 = require("@nestjs/common");
const admin_dto_1 = require("../../dto/admin/admin-dto");
const contributor_dto_1 = require("../../dto/contributor/contributor-dto");
const shared_interfaces_1 = require("../../interface/shared-interfaces");
const db_mediator_service_1 = require("../db-mediator/db-mediator.service");
let PrivilegeService = class PrivilegeService {
    constructor(dbMediatorService) {
        this.dbMediatorService = dbMediatorService;
    }
    async fetchContributorPrivilege(contributor_id) {
        return await this.dbMediatorService.fetchContributorPrivilege(contributor_id);
    }
    async fetchAdminPrivilege(admin_id) {
        return await (await this.dbMediatorService.fetchAdmin({ _id: admin_id })).privilege;
    }
    async changeAdminPrivilege(admin_id, modified_privilege) {
        return await this.dbMediatorService.updateAdmin({ _id: admin_id }, { $set: { "privilege": modified_privilege } });
    }
    async changeContributorPrivilege(contributor_id, modified_privilege) {
        return await this.dbMediatorService.updateContributor({ _id: contributor_id }, { $set: { "privilege": modified_privilege } });
    }
    newAdminPrivilege(identity) {
        let newPrivilege = new admin_dto_1.AdminPrivilegeModel();
        switch (identity) {
            case "head":
                newPrivilege.canAcceptContributorsRequests = true;
                newPrivilege.canAcceptDepositRequests = true;
                newPrivilege.canAcceptSignupRequests = true;
                newPrivilege.canAcceptWithdrawalRequests = true;
                newPrivilege.canCreateAccountForContributors = true;
                newPrivilege.canCreditOthers = true;
                newPrivilege.canCreditTradingBalance = true;
                newPrivilege.canDebitOthersWithChecks = true;
                newPrivilege.canDebitOthersWithoutChecks = true;
                newPrivilege.canDebitTradingBalance = true;
                newPrivilege.canDepositSelf = true;
                newPrivilege.canEditSignupRequestData = true;
                newPrivilege.canMakeContributorsSuperOrSub = true;
                newPrivilege.canPlaceDepositRequest = true;
                newPrivilege.canPlaceWithdrawalRequest = true;
                newPrivilege.canRejectContributorsRequests = true;
                newPrivilege.canRemoveContributors = true;
                newPrivilege.canSeeCompanyProfile = true;
                newPrivilege.canWithdrawSelf = true;
                break;
            case "super":
                newPrivilege.canAcceptContributorsRequests = true;
                newPrivilege.canAcceptDepositRequests = true;
                newPrivilege.canAcceptSignupRequests = true;
                newPrivilege.canAcceptWithdrawalRequests = true;
                newPrivilege.canCreateAccountForContributors = true;
                newPrivilege.canCreditOthers = true;
                newPrivilege.canCreditTradingBalance = false;
                newPrivilege.canDebitOthersWithChecks = true;
                newPrivilege.canDebitOthersWithoutChecks = true;
                newPrivilege.canDebitTradingBalance = false;
                newPrivilege.canDepositSelf = true;
                newPrivilege.canEditSignupRequestData = true;
                newPrivilege.canMakeContributorsSuperOrSub = true;
                newPrivilege.canPlaceDepositRequest = true;
                newPrivilege.canPlaceWithdrawalRequest = true;
                newPrivilege.canRejectContributorsRequests = true;
                newPrivilege.canRemoveContributors = true;
                newPrivilege.canSeeCompanyProfile = false;
                newPrivilege.canWithdrawSelf = true;
                break;
            case "sub":
                newPrivilege.canAcceptContributorsRequests = true;
                newPrivilege.canAcceptDepositRequests = true;
                newPrivilege.canAcceptSignupRequests = true;
                newPrivilege.canAcceptWithdrawalRequests = true;
                newPrivilege.canCreateAccountForContributors = true;
                newPrivilege.canCreditOthers = true;
                newPrivilege.canCreditTradingBalance = false;
                newPrivilege.canDebitOthersWithChecks = true;
                newPrivilege.canDebitOthersWithoutChecks = false;
                newPrivilege.canDebitTradingBalance = false;
                newPrivilege.canDepositSelf = true;
                newPrivilege.canEditSignupRequestData = false;
                newPrivilege.canMakeContributorsSuperOrSub = true;
                newPrivilege.canPlaceDepositRequest = true;
                newPrivilege.canPlaceWithdrawalRequest = true;
                newPrivilege.canRejectContributorsRequests = false;
                newPrivilege.canRemoveContributors = false;
                newPrivilege.canSeeCompanyProfile = false;
                newPrivilege.canWithdrawSelf = true;
                break;
            default:
                break;
        }
        return newPrivilege;
    }
    toggleContributorDepositingAnyAmountAbility(privilege) {
        privilege = this.createUniquePrivilegeFrom(privilege);
        privilege.canDepositAnyAmount = privilege.canDepositAnyAmount ? false : true;
        return privilege;
    }
    toggleContributorChangingDailyDepositAbility(privilege) {
        privilege = this.createUniquePrivilegeFrom(privilege);
        privilege.canChangeDailyDeposit = privilege.canChangeDailyDeposit ? false : true;
        return privilege;
    }
    toggleContributorOpeningAccountForSubordinatesAbility(privilege) {
        privilege = this.createUniquePrivilegeFrom(privilege);
        privilege.canOpenAccountForSubordinates = privilege.canOpenAccountForSubordinates ? false : true;
        return privilege;
    }
    toggleContributorDepositingSubordinatesAbility(privilege) {
        privilege = this.createUniquePrivilegeFrom(privilege);
        privilege.canDepositSubordinates = privilege.canDepositSubordinates ? false : true;
        return privilege;
    }
    toggleContributorWithdrawingSubordinatesAbility(privilege) {
        privilege = this.createUniquePrivilegeFrom(privilege);
        privilege.canWithdrawSubordinates = privilege.canWithdrawSubordinates ? false : true;
        return privilege;
    }
    toggleContributorDepositingAbility(privilege) {
        privilege = this.createUniquePrivilegeFrom(privilege);
        privilege.canDeposit = privilege.canDeposit ? false : true;
        return privilege;
    }
    toggleContributorWithdrawalAbility(privilege) {
        privilege = this.createUniquePrivilegeFrom(privilege);
        privilege.canWithdraw = privilege.canWithdraw ? false : true;
        return privilege;
    }
    toggleContributorWithdrawingWhileImmatureAbility(privilege) {
        privilege = this.createUniquePrivilegeFrom(privilege);
        privilege.canWithdrawWhileImmature = privilege.canWithdrawWhileImmature ? false : true;
        return privilege;
    }
    createUniquePrivilegeFrom(privilege) {
        return Object.assign({}, privilege);
    }
};
PrivilegeService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [db_mediator_service_1.DbMediatorService])
], PrivilegeService);
exports.PrivilegeService = PrivilegeService;
//# sourceMappingURL=privilege.service.js.map