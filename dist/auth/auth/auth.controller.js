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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_dto_1 = require("../../shared/dto/auth/auth-dto");
const shared_interfaces_1 = require("../../shared/interface/shared-interfaces");
const auth_service_1 = require("../../shared/services/auth/auth.service");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async authenticateContributor(authCredential) {
        await this.checkRequiredAuthData(authCredential);
        return await this.authService.authenticateContributor(authCredential).then(authResult => {
            if (authResult.authenticated) {
                return authResult;
            }
            else {
                throw new common_1.HttpException(authResult.reason, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
            }
        });
    }
    async authenticateAdmin(authCredential) {
        await this.checkRequiredAuthData(authCredential);
        return await this.authService.authenticateAdmin(authCredential).then(authResult => {
            if (authResult.authenticated) {
                return authResult;
            }
            else {
                throw new common_1.HttpException(authResult.reason, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
            }
        });
    }
    async checkRequiredAuthData(payload) {
        if (!payload.auth_token) {
            if (!payload.login) {
                throw new common_1.HttpException("no login provided", common_1.HttpStatus.EXPECTATION_FAILED);
            }
            if (!payload.password) {
                throw new common_1.HttpException("no password provided", common_1.HttpStatus.EXPECTATION_FAILED);
            }
        }
    }
};
__decorate([
    common_1.Post('contributor'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.AuthDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "authenticateContributor", null);
__decorate([
    common_1.Post('admin'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.AuthDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "authenticateAdmin", null);
AuthController = __decorate([
    common_1.Controller('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map