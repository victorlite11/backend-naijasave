import { ActivitiesModel } from 'src/modules/shared/dto/contributor/contributor-dto';
import { ActivitiesService } from 'src/modules/shared/services/activities/activities.service';
export declare class ActivitiesController {
    private actvitiesService;
    constructor(actvitiesService: ActivitiesService);
    fetchPersonalActivitiesLog(contributor_id: string): Promise<ActivitiesModel>;
}
