import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AnnouncementsDto, Category } from 'src/modules/shared/dto/announcements/announcements-dto';
import { IdGenerator } from 'src/modules/shared/helpers/id-generator/id-generator';
import { OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { DbMediatorService } from '../../db-mediator/db-mediator.service';

@Injectable()
export class AnnouncementsService {
    constructor(
        private dbMediatorService: DbMediatorService
    ) {}

    async fetchAnnouncements(categories: Category): Promise<AnnouncementsDto[]> {
        let result = await this.dbMediatorService.fetchAnnouncements({})
        let filtered: AnnouncementsDto[] = [];

        if(categories.general) {
            filtered.push(...result.filter(announcement => announcement.category.general));
        }

        if(categories.admins) {
            let mapped = filtered.map(announcement => announcement._id);
            filtered.push(...result.
                                    filter(announcement => !mapped.includes(announcement._id)).
                                    filter(announcement => announcement.category.admins));
        }

        if(categories.superContributors) {
            let mapped = filtered.map(announcement => announcement._id);
            filtered.push(...result.
                                    filter(announcement => !mapped.includes(announcement._id)).
                                    filter(announcement => announcement.category.superContributors));
        }

        if(categories.subContributors) {
            let mapped = filtered.map(announcement => announcement._id);
            filtered.push(...result.
                                    filter(announcement => !mapped.includes(announcement._id)).
                                    filter(announcement => announcement.category.subContributors));
        }

        if(categories.investors) {
            let mapped = filtered.map(announcement => announcement._id);
            filtered.push(...result.
                                    filter(announcement => !mapped.includes(announcement._id)).
                                    filter(announcement => announcement.category.investors));
        }

        if(categories.contributors) {
            let mapped = filtered.map(announcement => announcement._id);
            filtered.push(...result.
                                    filter(announcement => !mapped.includes(announcement._id)).
                                    filter(announcement => announcement.category.contributors));
        }
        return filtered;
    }

    async createAnnouncement(announcement: AnnouncementsDto) {
        if (this.notificationHasNoSpecifiedCategory(announcement)) {
            throw new HttpException("No audience specified", HttpStatus.BAD_REQUEST)
        }

        announcement.date = new Date().toISOString();
        announcement._id = String(IdGenerator.getRand(999) + "-" + IdGenerator.getRand(999));
        await this.dbMediatorService.insertAnnouncement(announcement);
    }

    async updateAnnouncement(announcement: AnnouncementsDto) {

        if (this.notificationHasNoSpecifiedCategory(announcement)) {
            throw new HttpException("No audience specified", HttpStatus.BAD_REQUEST)
        }

        announcement.date = new Date().toISOString();

        await this.dbMediatorService.replaceAnnouncement({
            _id: announcement._id!!
        }, announcement);
    }

    async fetchAnnouncement(id: string): Promise<AnnouncementsDto> {
        return await this.dbMediatorService.fetchAnnouncement({
            _id: id
        });
    }

    async deleteAnnouncement(id: string): Promise<OperationFeedback> {
        return await this.dbMediatorService.deleteAnnouncement({
            _id: id
        });
    }

    private notificationHasNoSpecifiedCategory(announcement: AnnouncementsDto) {
        if (
            !announcement.category.admins && !announcement.category.contributors &&
            !announcement.category.general && !announcement.category.investors &&
            !announcement.category.subContributors && !announcement.category.superContributors
        ) {
            return true;
        } else {
            return false;
        }
    }

}
