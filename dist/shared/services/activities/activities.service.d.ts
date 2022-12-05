import { ActivitiesModel } from 'src/shared/dto/contributor/contributor-dto';
import { DbMediatorService } from '../db-mediator/db-mediator.service';
export declare class ActivitiesService {
    private dbMediatorService;
    constructor(dbMediatorService: DbMediatorService);
    fetchPersonalActivitiesLog(contributor_id: string): Promise<ActivitiesModel>;
}
