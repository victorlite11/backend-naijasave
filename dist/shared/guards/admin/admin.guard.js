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
exports.AdminGuard = void 0;
const common_1 = require("@nestjs/common");
const admin_dto_1 = require("../../dto/admin/admin-dto");
const db_mediator_service_1 = require("../../services/db-mediator/db-mediator.service");
let AdminGuard = class AdminGuard {
    constructor(dbMediator) {
        this.dbMediator = dbMediator;
    }
    canActivate(context) {
        return this.validate(context.switchToHttp().getRequest().user.userId);
    }
    async validate(userId) {
        if (!userId) {
            return false;
        }
        const admin = await this.dbMediator.fetchOne({ _id: userId }, { collection: "admins", db: "naijasave" });
        if (admin) {
            return true;
        }
        else {
            return false;
        }
    }
};
AdminGuard = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [db_mediator_service_1.DbMediatorService])
], AdminGuard);
exports.AdminGuard = AdminGuard;
//# sourceMappingURL=admin.guard.js.map