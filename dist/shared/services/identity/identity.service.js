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
exports.IdentityService = void 0;
const common_1 = require("@nestjs/common");
const admin_dto_1 = require("../../dto/admin/admin-dto");
const contributor_dto_1 = require("../../dto/contributor/contributor-dto");
const id_generator_1 = require("../../helpers/id-generator/id-generator");
const shared_interfaces_1 = require("../../interface/shared-interfaces");
const db_mediator_service_1 = require("../db-mediator/db-mediator.service");
const privilege_service_1 = require("../privilege/privilege.service");
let IdentityService = class IdentityService {
    constructor(dbMediatorService, privilegeService) {
        this.dbMediatorService = dbMediatorService;
        this.privilegeService = privilegeService;
    }
    async fetchContributorIdentity(contributor_id) {
        return await this.dbMediatorService.fetchContributorIdentity(contributor_id);
    }
    async fetchAdminIdentity(admin_id) {
        let admin = await this.dbMediatorService.fetchAdmin({ _id: admin_id });
        return admin.identity;
    }
    async changeAdminIdentity(admin_id, interested_identity) {
        let newIdentity = new admin_dto_1.AdminIdentityModel();
        switch (interested_identity.interested_identity) {
            case "head":
                newIdentity = this.makeHeadAdmin(newIdentity);
                break;
            case "sub":
                newIdentity = this.makeSubAdmin(newIdentity);
                break;
            case "super":
                newIdentity = this.makeSuperAdmin(newIdentity);
                break;
            default:
                break;
        }
        let admin = await this.dbMediatorService.fetchAdmin({ _id: admin_id });
        let newUsername = this.constructAdminUsername(admin, interested_identity.interested_identity);
        await this.dbMediatorService.registerAdminAction({
            _id: id_generator_1.IdGenerator.generateKey(25),
            identity: shared_interfaces_1.EntityIdentity.ADMIN,
            newAction: {
                description: `account type changed to ${interested_identity.interested_identity}`,
                date: new Date().toISOString(),
                type: {
                    is: "AccountTypeChange"
                }
            }
        });
        let newPrivilege = this.privilegeService.newAdminPrivilege(interested_identity.interested_identity);
        return await this.dbMediatorService.updateAdmin({ _id: admin_id }, { $set: { "identity": newIdentity } }).then(async (_) => {
            return await this.dbMediatorService.updateAdmin({ _id: admin_id }, { $set: { "credentials.username": newUsername } }).then(async (_) => {
                return await this.dbMediatorService.updateAdmin({ _id: admin_id }, { $set: { "privilege": newPrivilege } });
            });
        });
    }
    constructAdminUsername(admin, interested_identity) {
        let username = "admin";
        username += "-";
        username += interested_identity.toLocaleLowerCase();
        username += "-";
        username += admin.basicInformation.name.split(/\s/)[0];
        username += "-";
        username += id_generator_1.IdGenerator.getRand(9999);
        return username;
    }
    async changeContributorIdentity(contributor_id, interested_identity) {
        let newIdentity = new contributor_dto_1.IdentityModel();
        let shouldRevertSubordinates = false;
        switch (interested_identity.interested_identity) {
            case "contributor":
                newIdentity = this.makeContributor(newIdentity);
                shouldRevertSubordinates = true;
                break;
            case "investor":
                newIdentity = this.makeInvestor(newIdentity);
                shouldRevertSubordinates = true;
                break;
            case "sub":
                newIdentity = this.makeSubContributor(newIdentity);
                break;
            case "super":
                newIdentity = this.makeSuperContributor(newIdentity);
                break;
            default:
                break;
        }
        let c = await this.dbMediatorService.fetchContributor({ _id: contributor_id });
        await this.dbMediatorService.registerContributorAction({
            _id: id_generator_1.IdGenerator.generateKey(25),
            identity: shared_interfaces_1.EntityIdentity.CONTRIBUTOR,
            newAction: {
                description: `account type changed to ${interested_identity.interested_identity}`,
                date: new Date().toISOString(),
                type: {
                    is: "AccountTypeChange"
                }
            }
        });
        if (shouldRevertSubordinates && (c.identity.isSubContributor || c.identity.isSuperContributor)) {
            let s = await this.dbMediatorService.fetchContributors({ "basicInformation.overseerId": contributor_id });
            let headAdmin = await this.dbMediatorService.fetchAdmin({ "identity.isHeadAdmin": true });
            await s.forEach(async (subordinate) => {
                await this.dbMediatorService.updateContributorReferral({
                    _id: subordinate._id
                }, {
                    $set: { "basicInformation.overseerId": headAdmin._id }
                });
            });
        }
        return await this.dbMediatorService.updateContributor({ _id: contributor_id }, { $set: { "identity": newIdentity } });
    }
    makeHeadAdmin(identity) {
        identity = Object.assign({}, identity);
        identity.isSuperAdmin = false;
        identity.isSubAdmin = false;
        identity.isFeebleAdmin = false;
        identity.isHeadAdmin = true;
        return identity;
    }
    makeSuperAdmin(identity) {
        identity = Object.assign({}, identity);
        identity.isSuperAdmin = true;
        identity.isSubAdmin = false;
        identity.isFeebleAdmin = false;
        identity.isHeadAdmin = false;
        return identity;
    }
    makeSubAdmin(identity) {
        identity = Object.assign({}, identity);
        identity.isSuperAdmin = false;
        identity.isSubAdmin = true;
        identity.isFeebleAdmin = false;
        identity.isHeadAdmin = false;
        return identity;
    }
    makeFeebleAdmin(identity) {
        identity = Object.assign({}, identity);
        identity.isSuperAdmin = false;
        identity.isSubAdmin = false;
        identity.isFeebleAdmin = true;
        identity.isHeadAdmin = false;
        return identity;
    }
    makeInvestor(identity) {
        identity = this.createUniqueIdentityFrom(identity);
        identity = this.revokePrivilege(identity);
        identity.isContributor = false;
        identity.isInvestor = true;
        return identity;
    }
    makeContributor(identity) {
        identity = this.createUniqueIdentityFrom(identity);
        identity = this.revokePrivilege(identity);
        identity.isContributor = true;
        identity.isInvestor = false;
        return identity;
    }
    makeSuperContributor(identity) {
        identity = this.createUniqueIdentityFrom(identity);
        identity = this.turnOffNormalIdentities(identity);
        identity.isSuperContributor = true;
        identity.isSubContributor = false;
        return identity;
    }
    makeSubContributor(identity) {
        identity = this.createUniqueIdentityFrom(identity);
        identity = this.turnOffNormalIdentities(identity);
        identity.isSuperContributor = false;
        identity.isSubContributor = true;
        return identity;
    }
    revokePrivilege(identity) {
        identity = this.createUniqueIdentityFrom(identity);
        identity.isSuperContributor = false;
        identity.isSubContributor = false;
        if (identity.wasContributor) {
            identity.isContributor = true;
            identity.wasContributor = false;
        }
        if (identity.wasInvestor) {
            identity.isInvestor = true;
            identity.wasInvestor = false;
        }
        return identity;
    }
    turnOffNormalIdentities(identity) {
        identity = this.createUniqueIdentityFrom(identity);
        if (identity.isContributor) {
            identity.wasContributor = true;
        }
        if (identity.isInvestor) {
            identity.wasInvestor = true;
        }
        identity.isContributor = false;
        identity.isInvestor = false;
        return identity;
    }
    createUniqueIdentityFrom(identity) {
        return Object.assign({}, identity);
    }
};
IdentityService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [db_mediator_service_1.DbMediatorService,
        privilege_service_1.PrivilegeService])
], IdentityService);
exports.IdentityService = IdentityService;
//# sourceMappingURL=identity.service.js.map