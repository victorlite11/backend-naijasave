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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContributorsService = void 0;
const common_1 = require("@nestjs/common");
const basic_contributor_dto_1 = require("../../../modules/shared/dto/basic-contributor/basic-contributor-dto");
const signup_request_dto_1 = require("../../../modules/shared/dto/signup-request/signup-request-dto");
const id_generator_1 = require("../../../modules/shared/helpers/id-generator/id-generator");
const shared_interfaces_1 = require("../../../modules/shared/interface/shared-interfaces");
const accounting_service_1 = require("../../../modules/shared/services/accounting/accounting.service");
const company_service_1 = require("../../../modules/shared/services/company/company.service");
const identity_service_1 = require("../../../modules/shared/services/identity/identity.service");
const privilege_service_1 = require("../../../modules/shared/services/privilege/privilege.service");
const sms_mediator_service_1 = require("../../../modules/shared/services/sms-mediator/sms-mediator/sms-mediator.service");
const admin_1 = require("../../../modules/core/dtos/admin/admin");
const contributor_dto_1 = require("../../../modules/shared/dto/contributor/contributor-dto");
const db_mediator_service_1 = require("../db-mediator/db-mediator.service");
const admin_service_1 = require("../admin/admin.service");
const company_dto_1 = require("../../../modules/shared/dto/company/company-dto");
const bcrypt = require("bcrypt");
const constants_1 = require("../../../modules/auth/constants");
let ContributorsService = class ContributorsService {
    constructor(identityService, privilegeService, accountingService, dbMediatorService, companyService, adminsService, smsMediatorService) {
        this.identityService = identityService;
        this.privilegeService = privilegeService;
        this.accountingService = accountingService;
        this.dbMediatorService = dbMediatorService;
        this.companyService = companyService;
        this.adminsService = adminsService;
        this.smsMediatorService = smsMediatorService;
    }
    async fetchContributors(queries) {
        let query = {};
        if (queries.status) {
            switch (queries.status) {
                case 'active':
                    query["activities.status"] = { $eq: "active" };
                    break;
                case 'inactive':
                    query["activities.status"] = { $eq: "inactive" };
                    break;
                default:
                    break;
            }
        }
        if (queries.identity) {
            switch (queries.identity) {
                case 'super-contributors':
                    query["identity.isSuperContributor"] = { $eq: true };
                    break;
                case 'sub-contributors':
                    query["identity.isSubContributor"] = { $eq: true };
                    break;
                case 'investors':
                    query["identity.isInvestor"] = { $eq: true };
                    break;
                case 'contributors':
                    query["identity.isContributor"] = { $eq: true };
                    break;
                default:
                    break;
            }
        }
        if (queries.overseer_id) {
            query["basicInformation.overseerId"] = { $eq: queries.overseer_id };
        }
        let keys = Object.keys(query);
        let values = Object.values(query);
        let andQueries = [];
        for (let i = 0; i < keys.length; i++) {
            let blankObj = {};
            blankObj[`${keys[i]}`] = values[i];
            andQueries.push(blankObj);
            blankObj = {};
        }
        let andQuery = { $and: andQueries };
        try {
            if (andQueries.length > 0) {
                return await this.dbMediatorService.fetchAll(andQuery, {
                    db: "naijasave",
                    collection: "contributors"
                });
            }
            else {
                return await this.dbMediatorService.fetchAll(query, {
                    db: "naijasave",
                    collection: "contributors"
                });
            }
        }
        catch (e) {
            throw e;
        }
    }
    async fetchContributor(id) {
        let contributor;
        try {
            contributor = await this.dbMediatorService.fetchOne({ _id: id }, {
                db: "naijasave",
                collection: "contributors"
            });
            if (contributor) {
                let contributorOverseerId = contributor.basicInformation.overseerId;
                let overseer = await this.dbMediatorService.fetchOne({ _id: contributorOverseerId }, {
                    db: "naijasave",
                    collection: "admins"
                });
                if (!overseer) {
                    overseer = await this.dbMediatorService.fetchOne({ _id: contributorOverseerId }, {
                        db: "naijasave",
                        collection: "contributors"
                    });
                }
                if (!overseer) {
                    overseer = await this.adminsService.getHeadAdmin();
                    await this.dbMediatorService.updateOne({ _id: contributor._id }, { $set: { "basicInformation.overseerId": overseer._id } }, { collection: "contributors", db: "naijasave" });
                }
                contributor.basicInformation.overseerId = `${overseer.basicInformation.name.split(/\s/)[0]} (${overseer.credentials.phoneNumber})`;
                return contributor;
            }
        }
        catch (e) {
            throw e;
        }
    }
    async getContributorOverseer(contributor_id) {
        try {
            let contributor = await this.dbMediatorService.fetchOne({ _id: contributor_id }, {
                db: "naijasave",
                collection: "contributors"
            });
            let contributorOverseerDetails = new basic_contributor_dto_1.BasicContributorOverseerModel();
            if (contributor) {
                let contributorOverseerId = contributor.basicInformation.overseerId;
                let adminOverseer = await this.dbMediatorService.fetchOne({ _id: contributorOverseerId }, {
                    db: "naijasave",
                    collection: "admins"
                });
                if (adminOverseer) {
                    contributorOverseerDetails.name = adminOverseer.basicInformation.name;
                    contributorOverseerDetails.identity = "admin";
                    contributorOverseerDetails.username = adminOverseer.credentials.username;
                    contributorOverseerDetails._id = adminOverseer._id;
                }
                else {
                    let contributorOverseer = await this.dbMediatorService.fetchOne({ _id: contributorOverseerId }, {
                        collection: "contributors",
                        db: "naijasave"
                    });
                    if (contributorOverseer) {
                        contributorOverseerDetails.name = contributorOverseer.basicInformation.name;
                        contributorOverseerDetails.identity = "contributor";
                        contributorOverseerDetails.phoneNumber = contributorOverseer.credentials.phoneNumber;
                        contributorOverseerDetails._id = contributorOverseer._id;
                        contributorOverseerDetails.status = contributorOverseer.activities.status;
                    }
                }
                return contributorOverseerDetails;
            }
        }
        catch (e) {
            throw e;
        }
    }
    async changeUsername(id, username, sms) {
        await this.dbMediatorService.updateOne({ _id: id }, { $set: { "credentials.username": username } }, {
            collection: "contributors",
            db: "naijasave"
        });
        if (sms) {
            await this.smsMediatorService.sendAccountChangeSMS(id, sms);
        }
        return true;
    }
    async changeOverseerIds() {
        const headAdmin = await this.adminsService.getHeadAdmin();
        await this.dbMediatorService.updateOne({}, {
            $set: { "account.totalWithdrawn": "0" }
        }, {
            db: "naijasave",
            collection: "contributors"
        });
    }
    async changeOverseer(contributor_id, new_overseer_id) {
        if (!(await this.adminsService.fetchAdmin(new_overseer_id))) {
            if (!(await this.fetchContributor(contributor_id))) {
                throw new common_1.HttpException("No Admin or Contributor with the provided ID", common_1.HttpStatus.BAD_REQUEST);
            }
        }
        return await this.dbMediatorService.updateOne({ _id: contributor_id }, { $set: { "basicInformation.overseerId": new_overseer_id } }, {
            collection: "contributors",
            db: "naijasave"
        }).then(r => {
            if (r.success) {
                return {
                    success: true,
                    message: "Overseer changed successfully"
                };
            }
            else {
                return {
                    success: false,
                    message: "Could not change overseer"
                };
            }
        });
    }
    async deleteContributor(id) {
        await this.dbMediatorService.deleteOne({ _id: id }, {
            collection: "contributors",
            db: "naijasave"
        });
        return true;
    }
    async registerContributorAction(payload) {
        await this.dbMediatorService.updateOne({ _id: payload._id }, { $push: { "activities.actions": payload.newAction } }, {
            db: "naijasave",
            collection: "contributors"
        });
    }
    async updateContributorAccount(payload) {
        await this.dbMediatorService.updateOne({ _id: payload._id }, { $set: { "account.balance": payload.account.balance } }, {
            db: "naijasave",
            collection: "contributors"
        });
    }
    async createNewContributor(signupRequest) {
        let newContributor = new contributor_dto_1.ContributorDto();
        newContributor._id = signupRequest._id;
        newContributor.referral.code = String(id_generator_1.IdGenerator.generateReferralCode(9999999));
        await this.setBasicInfo(newContributor.basicInformation, signupRequest);
        this.setCredentials(newContributor.credentials, signupRequest);
        this.setLocation(newContributor.location, signupRequest);
        switch (signupRequest.accountType) {
            case 'investor':
                newContributor.identity = this.identityService.makeInvestor(newContributor.identity);
                break;
            default:
                newContributor.identity = this.identityService.makeContributor(newContributor.identity);
                break;
        }
        newContributor.privilege = this.privilegeService.toggleContributorWithdrawalAbility(newContributor.privilege);
        newContributor.privilege = this.privilegeService.toggleContributorDepositingAbility(newContributor.privilege);
        switch (signupRequest.accountType) {
            case 'investor':
                newContributor.privilege = this.privilegeService.toggleContributorDepositingAnyAmountAbility(newContributor.privilege);
                newContributor.privilege = this.privilegeService.toggleContributorChangingDailyDepositAbility(newContributor.privilege);
                newContributor.privilege = this.privilegeService.toggleContributorWithdrawingWhileImmatureAbility(newContributor.privilege);
                break;
            default:
                break;
        }
        this.defineActivities(newContributor.activities, signupRequest);
        newContributor.account.balance = 0;
        newContributor.account.dailySavings = signupRequest.dailySavings;
        newContributor.account.commission = {
            balance: 0
        };
        await this.dbMediatorService.insertOne(newContributor, {
            db: "naijasave",
            collection: "contributors"
        });
        await this.dbMediatorService.deleteOne({ _id: signupRequest._id }, {
            db: "naijasave",
            collection: "signup_requests"
        });
    }
    async updateDatabase() {
        const allContributors = await this.dbMediatorService.fetchAll({}, { db: "naijasave", collection: "admins" });
        let successfulUpdate = 0;
        for (let i = 0; i < allContributors.length; i++) {
            let c = allContributors[i];
            console.log(c._id);
            successfulUpdate += 1;
            await this.dbMediatorService.updateOne({ _id: c._id }, {
                $set: { account: {
                        balance: Number(c.account.balance),
                        commission: {
                            balance: 0
                        },
                        dailySavings: 100,
                        bankDetails: c.account.bankDetails
                    }
                }
            }, { db: "naijasave", collection: "admins" }).then(r => {
                successfulUpdate += 1;
            });
        }
        console.log(successfulUpdate);
        return successfulUpdate;
    }
    async setBasicInfo(basicInformation, signupRequest) {
        basicInformation.age = Number(signupRequest.age);
        basicInformation.dateOfBirth = signupRequest.dateOfBirth || "";
        basicInformation.gender = signupRequest.gender;
        basicInformation.name = signupRequest.name;
        basicInformation.nextOfKin = signupRequest.nextOfKin;
        basicInformation.overseerId = signupRequest.overseerId;
        if (!signupRequest.overseerId || signupRequest.overseerId.length < 4) {
            basicInformation.overseerId = (await this.adminsService.getHeadAdmin())._id;
        }
        basicInformation.referralCode = signupRequest.referrer || "";
    }
    async setCredentials(credentials, signupRequest) {
        credentials.email = signupRequest.email;
        credentials.password = await bcrypt.hash(signupRequest.password, constants_1.passwordHashConstant.saltOrRounds);
        credentials.phoneNumber = signupRequest.phoneNumber;
        credentials.username = signupRequest.username;
    }
    setLocation(location, signupRequest) {
        location.address = signupRequest.address;
        location.country = signupRequest.country;
        location.localGovernment = signupRequest.localGovernment;
        location.state = signupRequest.state;
    }
    defineActivities(activities, signupRequest) {
        let now = new Date().toISOString();
        activities.status = 'active';
        activities.regDate = signupRequest.regDate;
        activities.approvalDate = now;
        activities.lastLogin = activities.regDate;
    }
};
ContributorsService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [identity_service_1.IdentityService,
        privilege_service_1.PrivilegeService,
        accounting_service_1.AccountingService, typeof (_a = typeof db_mediator_service_1.DbMediatorService !== "undefined" && db_mediator_service_1.DbMediatorService) === "function" ? _a : Object, company_service_1.CompanyService, typeof (_b = typeof admin_service_1.AdminService !== "undefined" && admin_service_1.AdminService) === "function" ? _b : Object, sms_mediator_service_1.SmsMediatorService])
], ContributorsService);
exports.ContributorsService = ContributorsService;
//# sourceMappingURL=contributors.service.js.map