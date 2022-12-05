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
exports.AnnouncementsController = void 0;
const common_1 = require("@nestjs/common");
const announcements_dto_1 = require("../../modules/shared/dto/announcements/announcements-dto");
const authenticated_guard_1 = require("../../modules/shared/guards/authenticated/authenticated.guard");
const shared_interfaces_1 = require("../../modules/shared/interface/shared-interfaces");
const announcements_service_1 = require("../../modules/shared/services/announcements/announcements/announcements.service");
let AnnouncementsController = class AnnouncementsController {
    constructor(announcementsService) {
        this.announcementsService = announcementsService;
    }
    async fetchAnnouncements(count, category) {
        let announcements = await this.announcementsService.fetchAnnouncements(category);
        if (count) {
            let announcementCount = new shared_interfaces_1.AnnouncementsCountResponse();
            announcementCount.total = announcements.length;
            return announcementCount;
        }
        else {
            return announcements;
        }
    }
    async createAnnouncement(announcement) {
        await this.announcementsService.createAnnouncement(announcement);
    }
    async updateAnnouncement(announcement) {
        await this.announcementsService.updateAnnouncement(announcement);
        return true;
    }
    async fetchAnnouncement(id) {
        return await this.announcementsService.fetchAnnouncement(id);
    }
    async deleteAnnouncement(id) {
        return await this.announcementsService.deleteAnnouncement(id);
    }
};
__decorate([
    common_1.Post('fetch-announcements'),
    __param(0, common_1.Query('count')), __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, announcements_dto_1.Category]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "fetchAnnouncements", null);
__decorate([
    common_1.Post('new-announcement'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [announcements_dto_1.AnnouncementsDto]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "createAnnouncement", null);
__decorate([
    common_1.Post('update-announcement'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [announcements_dto_1.AnnouncementsDto]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "updateAnnouncement", null);
__decorate([
    common_1.Get('fetch-announcement'),
    __param(0, common_1.Query('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "fetchAnnouncement", null);
__decorate([
    common_1.Delete('delete-announcement'),
    __param(0, common_1.Query('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "deleteAnnouncement", null);
AnnouncementsController = __decorate([
    common_1.Controller('announcements'),
    common_1.UseGuards(authenticated_guard_1.AuthenticatedGuard),
    __metadata("design:paramtypes", [announcements_service_1.AnnouncementsService])
], AnnouncementsController);
exports.AnnouncementsController = AnnouncementsController;
//# sourceMappingURL=announcements.controller.js.map