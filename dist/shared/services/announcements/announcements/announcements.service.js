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
exports.AnnouncementsService = void 0;
const common_1 = require("@nestjs/common");
const announcements_dto_1 = require("../../../dto/announcements/announcements-dto");
const id_generator_1 = require("../../../helpers/id-generator/id-generator");
const shared_interfaces_1 = require("../../../interface/shared-interfaces");
const db_mediator_service_1 = require("../../db-mediator/db-mediator.service");
let AnnouncementsService = class AnnouncementsService {
    constructor(dbMediatorService) {
        this.dbMediatorService = dbMediatorService;
    }
    async fetchAnnouncements(categories) {
        let result = await this.dbMediatorService.fetchAnnouncements({});
        let filtered = [];
        if (categories.general) {
            filtered.push(...result.filter(announcement => announcement.category.general));
        }
        if (categories.admins) {
            let mapped = filtered.map(announcement => announcement._id);
            filtered.push(...result.
                filter(announcement => !mapped.includes(announcement._id)).
                filter(announcement => announcement.category.admins));
        }
        if (categories.superContributors) {
            let mapped = filtered.map(announcement => announcement._id);
            filtered.push(...result.
                filter(announcement => !mapped.includes(announcement._id)).
                filter(announcement => announcement.category.superContributors));
        }
        if (categories.subContributors) {
            let mapped = filtered.map(announcement => announcement._id);
            filtered.push(...result.
                filter(announcement => !mapped.includes(announcement._id)).
                filter(announcement => announcement.category.subContributors));
        }
        if (categories.investors) {
            let mapped = filtered.map(announcement => announcement._id);
            filtered.push(...result.
                filter(announcement => !mapped.includes(announcement._id)).
                filter(announcement => announcement.category.investors));
        }
        if (categories.contributors) {
            let mapped = filtered.map(announcement => announcement._id);
            filtered.push(...result.
                filter(announcement => !mapped.includes(announcement._id)).
                filter(announcement => announcement.category.contributors));
        }
        return filtered;
    }
    async createAnnouncement(announcement) {
        if (this.notificationHasNoSpecifiedCategory(announcement)) {
            throw new common_1.HttpException("No audience specified", common_1.HttpStatus.BAD_REQUEST);
        }
        announcement.date = new Date().toISOString();
        announcement._id = String(id_generator_1.IdGenerator.getRand(999) + "-" + id_generator_1.IdGenerator.getRand(999));
        await this.dbMediatorService.insertAnnouncement(announcement);
    }
    async updateAnnouncement(announcement) {
        if (this.notificationHasNoSpecifiedCategory(announcement)) {
            throw new common_1.HttpException("No audience specified", common_1.HttpStatus.BAD_REQUEST);
        }
        announcement.date = new Date().toISOString();
        await this.dbMediatorService.replaceAnnouncement({
            _id: announcement._id
        }, announcement);
    }
    async fetchAnnouncement(id) {
        return await this.dbMediatorService.fetchAnnouncement({
            _id: id
        });
    }
    async deleteAnnouncement(id) {
        return await this.dbMediatorService.deleteAnnouncement({
            _id: id
        });
    }
    notificationHasNoSpecifiedCategory(announcement) {
        if (!announcement.category.admins && !announcement.category.contributors &&
            !announcement.category.general && !announcement.category.investors &&
            !announcement.category.subContributors && !announcement.category.superContributors) {
            return true;
        }
        else {
            return false;
        }
    }
};
AnnouncementsService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [db_mediator_service_1.DbMediatorService])
], AnnouncementsService);
exports.AnnouncementsService = AnnouncementsService;
//# sourceMappingURL=announcements.service.js.map