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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const admin_1 = require("../../../modules/core/dtos/admin/admin");
const contributor_1 = require("../../../modules/core/dtos/contributor/contributor");
const auth_dto_1 = require("../../../modules/shared/dto/auth/auth-dto");
const id_generator_1 = require("../../../modules/shared/helpers/id-generator/id-generator");
const shared_interfaces_1 = require("../../../modules/shared/interface/shared-interfaces");
const db_mediator_service_1 = require("../db-mediator/db-mediator.service");
const sms_mediator_service_1 = require("../sms-mediator/sms-mediator/sms-mediator.service");
let AuthService = class AuthService {
    constructor(dbMediatorService, smsMediatorService) {
        this.dbMediatorService = dbMediatorService;
        this.smsMediatorService = smsMediatorService;
    }
    async authenticateAdmin(credential) {
        if (credential.auth_token) {
            let token = await this.dbMediatorService.fetchOne({ token: credential.auth_token }, {
                db: "naijasave",
                collection: "auth_tokens"
            });
            if (token) {
                if (this.tokenIsExpired(token.expires)) {
                    return await this.checkAndUseAdminLoginDetails(credential);
                }
                else {
                    return { authenticated: true, authToken: token.token, for: token.for };
                }
            }
            else {
                return await this.checkAndUseAdminLoginDetails(credential);
            }
        }
        else {
            return await this.checkAndUseAdminLoginDetails(credential);
        }
    }
    async checkAndUseAdminLoginDetails(credential) {
        if (credential.login && credential.password) {
            return await this.authenticateAdminWithLoginCredentials({
                login: credential.login,
                password: credential.password,
                remember: credential.remember && credential.remember == "true" ? true : false
            });
        }
        else {
            return { authenticated: false, reason: "Missing credentials" };
        }
    }
    async authenticateAdminWithLoginCredentials(credential) {
        let admin = await this.dbMediatorService.fetchOne({ "credentials.phoneNumber": credential.login }, { db: "naijasave", collection: "admins" });
        if (!admin) {
            return { authenticated: false, reason: "Phone number not recognized" };
        }
        if (admin.credentials.password !== credential.password) {
            return { authenticated: false, reason: "Password incorrect" };
        }
        let token = id_generator_1.IdGenerator.generateAuthToken();
        let longDays = 60;
        let shortDays = 1;
        let savedToken = await this.dbMediatorService.fetchOne({ for: admin._id }, {
            db: "naijasave",
            collection: "auth_tokens"
        });
        if (savedToken) {
            if (!this.tokenIsExpired(savedToken.expires)) {
                await this.dbMediatorService.updateOne({ for: admin._id }, { $set: {
                        expires: credential.remember ?
                            String((86400000 * longDays) + Date.now()) :
                            String((86400000 * shortDays) + Date.now())
                    } }, {
                    db: "naijasave",
                    collection: "auth_tokens"
                });
                return { authenticated: true, authToken: savedToken.token };
            }
        }
        let key = {
            _id: id_generator_1.IdGenerator.generateKey(12),
            token: token,
            expires: credential.remember ?
                String((86400000 * longDays) + Date.now()) :
                String((86400000 * shortDays) + Date.now()),
            created: new Date().toISOString(),
            for: admin._id
        };
        await this.dbMediatorService.insertOne(key, {
            db: "naijasave",
            collection: "auth_tokens"
        });
        return { authenticated: true, authToken: token };
    }
    async authenticateContributor(credential) {
        if (credential.auth_token) {
            let token = await this.dbMediatorService.fetchOne({ token: credential.auth_token }, {
                db: "naijasave",
                collection: "auth_tokens"
            });
            if (token) {
                if (this.tokenIsExpired(token.expires)) {
                    return await this.checkAndUseContributorLoginDetails(credential);
                }
                else {
                    return { authenticated: true, authToken: token.token, for: token.for };
                }
            }
            else {
                return await this.checkAndUseContributorLoginDetails(credential);
            }
        }
        else {
            return await this.checkAndUseContributorLoginDetails(credential);
        }
    }
    async checkAndUseContributorLoginDetails(credential) {
        if (credential.login && credential.password) {
            return await this.authenticateContributorWithLoginCredentials({
                login: credential.login,
                password: credential.password,
                remember: credential.remember && credential.remember == "true" ? true : false
            });
        }
        else {
            return { authenticated: false, reason: "Missing credentials" };
        }
    }
    tokenIsExpired(tokenExpiryDate) {
        let now = Date.now();
        let xpiryDate = Number(tokenExpiryDate);
        return now > xpiryDate ? true : false;
    }
    async authenticateContributorWithLoginCredentials(credential) {
        let contributor = await this.dbMediatorService.fetchOne({ "credentials.phoneNumber": credential.login }, {
            db: "naijasave",
            collection: "contributors"
        });
        if (!contributor) {
            contributor = await this.dbMediatorService.fetchOne({ "credentials.username": credential.login }, {
                db: "naijasave",
                collection: "contributors"
            });
        }
        if (!contributor) {
            return { authenticated: false, reason: "Phone number or username not recognized" };
        }
        if (contributor.credentials.password !== credential.password) {
            return { authenticated: false, reason: "Password incorrect" };
        }
        let token = id_generator_1.IdGenerator.generateAuthToken();
        let longDays = 60;
        let shortDays = 1;
        let savedToken = await this.dbMediatorService.fetchOne({ for: contributor._id }, {
            db: "naijasave",
            collection: "auth_tokens"
        });
        if (savedToken) {
            if (!this.tokenIsExpired(savedToken.expires)) {
                await this.dbMediatorService.updateOne({ for: contributor._id }, { $set: {
                        expires: credential.remember ?
                            String((86400000 * longDays) + Date.now()) :
                            String((86400000 * shortDays) + Date.now())
                    } }, {
                    db: "naijasave",
                    collection: "auth_tokens"
                });
                return { authenticated: true, authToken: savedToken.token };
            }
        }
        let key = {
            _id: id_generator_1.IdGenerator.generateKey(12),
            token: token,
            expires: credential.remember ?
                String((86400000 * longDays) + Date.now()) :
                String((86400000 * shortDays) + Date.now()),
            created: new Date().toISOString(),
            for: contributor._id
        };
        await this.dbMediatorService.insertOne(key, {
            db: "naijasave",
            collection: "auth_tokens"
        });
        return { authenticated: true, authToken: token };
    }
};
AuthService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof db_mediator_service_1.DbMediatorService !== "undefined" && db_mediator_service_1.DbMediatorService) === "function" ? _a : Object, typeof (_b = typeof sms_mediator_service_1.SmsMediatorService !== "undefined" && sms_mediator_service_1.SmsMediatorService) === "function" ? _b : Object])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map