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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const admin_dto_1 = require("../../dto/admin/admin-dto");
const new_admin_dto_1 = require("../../dto/new-admin/new-admin-dto");
const id_generator_1 = require("../../helpers/id-generator/id-generator");
const shared_interfaces_1 = require("../../interface/shared-interfaces");
const accounting_service_1 = require("../accounting/accounting.service");
const identity_service_1 = require("../identity/identity.service");
const privilege_service_1 = require("../privilege/privilege.service");
const qualification_service_1 = require("../qualification/qualification.service");
const db_mediator_service_1 = require("../db-mediator/db-mediator.service");
const bcrypt = require("bcrypt");
const constants_1 = require("../../../modules/auth/constants");
let AdminService = class AdminService {
    constructor(dbMediatorService, identityService, accountingService, privilegeService, qualificationService) {
        this.dbMediatorService = dbMediatorService;
        this.identityService = identityService;
        this.accountingService = accountingService;
        this.privilegeService = privilegeService;
        this.qualificationService = qualificationService;
    }
    async fetchAdmin(id) {
        return await this.dbMediatorService.fetchOne({ _id: id }, { collection: "admins", db: "naijasave" });
    }
    async fetchAdmins(query) {
        return await this.dbMediatorService.fetchAll(query, { collection: "admins", db: "naijasave" });
    }
    async registerAdminAction(payload) {
        await this.dbMediatorService.updateOne({ _id: payload._id }, { $push: { "activities.actions": payload.newAction } }, {
            collection: "admins",
            db: "naijasave"
        });
    }
    async updateAdminAccount(payload) {
        await this.dbMediatorService.updateOne({ _id: payload._id }, { $set: { "account.balance": payload.account.balance } }, {
            db: "naijasave",
            collection: "admins"
        });
    }
    async createAdmin(payload) {
        let newAdmin = new admin_dto_1.AdminDto();
        let headAdmin = await this.getHeadAdmin();
        let search = await this.dbMediatorService.fetchOne({ "credentials.phoneNumber": payload.phoneNumber }, {
            db: "naijasave",
            collection: "admins"
        });
        if (search) {
            throw new common_1.HttpException("Admin already exists", common_1.HttpStatus.BAD_REQUEST);
        }
        search = await this.dbMediatorService.fetchOne({ "credentials.email": payload.email }, {
            db: "naijasave",
            collection: "admins"
        });
        if (search) {
            throw new common_1.HttpException("Admin already exists", common_1.HttpStatus.BAD_REQUEST);
        }
        newAdmin._id = id_generator_1.IdGenerator.generateAdminKey(40);
        newAdmin.basicInformation.name = payload.name;
        newAdmin.basicInformation.dateOfBirth = payload.dateOfBirth;
        newAdmin.basicInformation.gender = payload.gender;
        newAdmin.basicInformation.overseerId = payload.overseer_id || headAdmin._id;
        newAdmin.credentials.email = payload.email || "";
        newAdmin.credentials.password = await bcrypt.hash(payload.password, constants_1.passwordHashConstant.saltOrRounds);
        newAdmin.credentials.phoneNumber = payload.phoneNumber;
        newAdmin.credentials.username = this.constructAdminUsername(payload.name, payload.identity);
        newAdmin.location.country = payload.country;
        newAdmin.location.state = payload.state;
        newAdmin.location.localGovernment = payload.localGovernment;
        newAdmin.location.address = payload.address;
        if (payload.identity == "head") {
            let headAdmins = await this.dbMediatorService.fetchAll({ "identity.isHeadAdmin": true }, {
                collection: "admins",
                db: "naijasave"
            });
            if (headAdmins.length > 0) {
                throw new common_1.HttpException("Head Admin cannot be more than one", common_1.HttpStatus.BAD_REQUEST);
            }
        }
        newAdmin.identity = this.assignIdentity(newAdmin.identity, payload.identity);
        newAdmin.privilege = this.privilegeService.newAdminPrivilege(payload.identity);
        payload.overseer_id = payload.overseer_id || headAdmin._id;
        if (payload.overseer_id) {
            let overseer = await this.fetchAdmin(payload.overseer_id);
            await this.qualificationService.hasEnoughBalance(payload.starting_balance, overseer.account);
            let modifiedAccount = this.accountingService.minusBalance({ account: overseer.account, amount: payload.starting_balance });
            await this.dbMediatorService.updateOne({ _id: payload.overseer_id }, { $set: { account: modifiedAccount } }, {
                db: "naijasave",
                collection: "admins"
            });
        }
        newAdmin.account = this.accountingService.openAdminAccount({ balance: payload.starting_balance, account: newAdmin.account });
        await this.dbMediatorService.insertOne(newAdmin, {
            db: "naijasave",
            collection: "admins"
        });
        return { success: true, message: "created successfully" };
    }
    async getHeadAdmin() {
        return await this.dbMediatorService.fetchOne({ "identity.isHeadAdmin": true }, {
            db: "naijasave",
            collection: "admins"
        });
    }
    constructAdminUsername(name, identity) {
        return "admin-" + `${identity}-` + `${name.split(/\s/)[0]}-` + `${id_generator_1.IdGenerator.getRand(9999)}`;
    }
    assignIdentity(identityObj, identityString) {
        let newIdentity = Object.assign({}, identityObj);
        switch (identityString) {
            case "head":
                newIdentity = this.identityService.makeHeadAdmin(newIdentity);
                break;
            case "sub":
                newIdentity = this.identityService.makeSubAdmin(newIdentity);
                break;
            case "super":
                newIdentity = this.identityService.makeSuperAdmin(newIdentity);
                break;
            default:
                newIdentity = this.identityService.makeSubAdmin(newIdentity);
                break;
        }
        return newIdentity;
    }
};
AdminService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [db_mediator_service_1.DbMediatorService,
        identity_service_1.IdentityService,
        accounting_service_1.AccountingService,
        privilege_service_1.PrivilegeService,
        qualification_service_1.QualificationService])
], AdminService);
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map