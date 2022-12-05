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
exports.ReferralController = void 0;
const common_1 = require("@nestjs/common");
const contributor_dto_1 = require("../../modules/shared/dto/contributor/contributor-dto");
const basic_contributor_dto_1 = require("../../modules/shared/dto/basic-contributor/basic-contributor-dto");
const referral_service_1 = require("../../modules/shared/services/referral/referral/referral.service");
const shared_interfaces_1 = require("../../modules/shared/interface/shared-interfaces");
const authenticated_guard_1 = require("../../modules/shared/guards/authenticated/authenticated.guard");
let ReferralController = class ReferralController {
    constructor(referralService) {
        this.referralService = referralService;
    }
    async getReferralData(contributor_id) {
        return await this.referralService.constructAndReturnReferralData({ contributor_id: contributor_id });
    }
};
__decorate([
    common_1.Get('referral-data'),
    __param(0, common_1.Query('contributor_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReferralController.prototype, "getReferralData", null);
ReferralController = __decorate([
    common_1.Controller('referral'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __metadata("design:paramtypes", [referral_service_1.ReferralService])
], ReferralController);
exports.ReferralController = ReferralController;
//# sourceMappingURL=referral.controller.js.map