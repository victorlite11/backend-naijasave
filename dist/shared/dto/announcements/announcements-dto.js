"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = exports.AnnouncementsDto = void 0;
class AnnouncementsDto {
    constructor() {
        this.title = "";
        this.body = "";
        this.date = "";
        this.auther = "";
    }
}
exports.AnnouncementsDto = AnnouncementsDto;
class Category {
    constructor() {
        this.general = true;
        this.admins = false;
        this.investors = false;
        this.contributors = false;
        this.subContributors = false;
        this.superContributors = false;
    }
}
exports.Category = Category;
//# sourceMappingURL=announcements-dto.js.map