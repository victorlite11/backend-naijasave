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
exports.EntitiesMediatorService = void 0;
const common_1 = require("@nestjs/common");
const admin_dto_1 = require("../../../dto/admin/admin-dto");
const contributor_dto_1 = require("../../../dto/contributor/contributor-dto");
const shared_interfaces_1 = require("../../../interface/shared-interfaces");
const db_mediator_service_1 = require("../../db-mediator/db-mediator.service");
let EntitiesMediatorService = class EntitiesMediatorService {
    constructor(dbMediatorService) {
        this.dbMediatorService = dbMediatorService;
    }
    async exists(id) {
        return await this.isContributor(id).then(async (exists) => {
            if (exists) {
                return true;
            }
            else {
                return await this.isAdmin(id).then(async (exists) => {
                    if (exists) {
                        return true;
                    }
                    else {
                        return false;
                    }
                });
            }
        });
    }
    async isContributor(id) {
        if (await this.dbMediatorService.fetchContributor({ _id: id })) {
            return true;
        }
        else {
            return false;
        }
    }
    async isAdmin(id) {
        if (await this.dbMediatorService.fetchAdmin({ _id: id })) {
            return true;
        }
        else {
            return false;
        }
    }
    async fetchEntity(id) {
        let entity;
        let identity;
        if (await this.isAdmin(id)) {
            identity = shared_interfaces_1.EntityIdentity.ADMIN;
            entity = await this.dbMediatorService.fetchAdmin({ _id: id });
        }
        else {
            if (await this.isContributor(id)) {
                identity = shared_interfaces_1.EntityIdentity.CONTRIBUTOR;
                entity = await this.dbMediatorService.fetchContributor({ _id: id });
            }
            else {
                throw new common_1.NotFoundException(`Unable to find entity with id ${id}`);
            }
        }
        return { entity: entity, identity: identity };
    }
    async fetchEntityUsingPhoneNumber(phoneNumber) {
        let entity;
        let identity;
        entity = await this.dbMediatorService.fetchContributor({ "credentials.phoneNumber": phoneNumber });
        identity = shared_interfaces_1.EntityIdentity.CONTRIBUTOR;
        if (!entity) {
            entity = await this.dbMediatorService.fetchAdmin({ "credentials.phoneNumber": phoneNumber });
            identity = shared_interfaces_1.EntityIdentity.ADMIN;
            if (!entity) {
                throw new common_1.NotFoundException(`Cannot find user with this phone number ${phoneNumber}`);
            }
        }
        return { entity: entity, identity: identity };
    }
    async updateEntityAccount(payload, identity) {
        if (!identity) {
            if (this.isAdmin(payload._id)) {
                identity = shared_interfaces_1.EntityIdentity.ADMIN;
            }
            else {
                if (this.isContributor(payload._id)) {
                    identity = shared_interfaces_1.EntityIdentity.CONTRIBUTOR;
                }
                else {
                    throw new common_1.NotFoundException(`Cannot find entity with id ${payload._id}`);
                }
            }
        }
        if (identity == shared_interfaces_1.EntityIdentity.CONTRIBUTOR) {
            await this.dbMediatorService.updateContributorAccount({
                _id: payload._id,
                account: payload.account
            });
        }
        else {
            await this.dbMediatorService.updateAdminAccount({
                _id: payload._id,
                account: payload.account
            });
        }
    }
    async registerAction(payload) {
        if (!payload.identity) {
            if (this.isAdmin(payload._id)) {
                payload.identity = shared_interfaces_1.EntityIdentity.ADMIN;
            }
            else {
                if (this.isContributor(payload._id)) {
                    payload.identity = shared_interfaces_1.EntityIdentity.CONTRIBUTOR;
                }
                else {
                    throw new common_1.NotFoundException(`Cannot find entity with id ${payload._id}`);
                }
            }
        }
        if (payload.identity == shared_interfaces_1.EntityIdentity.ADMIN) {
            this.dbMediatorService.registerAdminAction(payload);
        }
        else {
            if (payload.identity == shared_interfaces_1.EntityIdentity.CONTRIBUTOR) {
                this.dbMediatorService.registerContributorAction(payload);
            }
        }
    }
};
EntitiesMediatorService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [db_mediator_service_1.DbMediatorService])
], EntitiesMediatorService);
exports.EntitiesMediatorService = EntitiesMediatorService;
//# sourceMappingURL=entities-mediator.service.js.map