import { AnnouncementsDto, Category } from 'src/modules/shared/dto/announcements/announcements-dto';
import { AnnouncementsCountResponse, OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { AnnouncementsService } from 'src/modules/shared/services/announcements/announcements/announcements.service';
export declare class AnnouncementsController {
    private announcementsService;
    constructor(announcementsService: AnnouncementsService);
    fetchAnnouncements(count: boolean, category: Category): Promise<AnnouncementsCountResponse | AnnouncementsDto[]>;
    createAnnouncement(announcement: AnnouncementsDto): Promise<void>;
    updateAnnouncement(announcement: AnnouncementsDto): Promise<boolean>;
    fetchAnnouncement(id: string): Promise<AnnouncementsDto>;
    deleteAnnouncement(id: string): Promise<OperationFeedback>;
}
