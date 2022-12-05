import { AnnouncementsDto, Category } from 'src/shared/dto/announcements/announcements-dto';
import { OperationFeedback } from 'src/shared/interface/shared-interfaces';
import { DbMediatorService } from '../../db-mediator/db-mediator.service';
export declare class AnnouncementsService {
    private dbMediatorService;
    constructor(dbMediatorService: DbMediatorService);
    fetchAnnouncements(categories: Category): Promise<AnnouncementsDto[]>;
    createAnnouncement(announcement: AnnouncementsDto): Promise<void>;
    updateAnnouncement(announcement: AnnouncementsDto): Promise<void>;
    fetchAnnouncement(id: string): Promise<AnnouncementsDto>;
    deleteAnnouncement(id: string): Promise<OperationFeedback>;
    private notificationHasNoSpecifiedCategory;
}
